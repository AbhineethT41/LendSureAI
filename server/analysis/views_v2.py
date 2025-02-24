from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from groq import Groq
import os
import json

from .models_v2 import LoanApplication, LoanAnalysisResult
from .serializers_v2 import (
    LoanApplicationSerializer, LoanApplicationListSerializer,
    LoanAnalysisResultSerializer, LoanAnalysisResultListSerializer
)
from .authentication import SupabaseAuthentication

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

class LoanApplicationViewSet(viewsets.ModelViewSet):
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LoanApplicationListSerializer
        return LoanApplicationSerializer
    
    def get_queryset(self):
        return LoanApplication.objects.filter(user=self.request.user)

    def process_natural_language(self, text):
        """Convert natural language input to structured JSON using Groq API"""
        try:
            # Prompt for Groq API to convert natural language to structured data
            prompt = f"""
            Convert the following natural language loan application description into structured JSON data.
            The output should include all relevant fields for a loan application including:
            - Customer information (name, age, job, income, etc.)
            - Existing debt information
            - Loan request details
            - Property information
            - Market factors

            Input text: {text}

            Format the output as valid JSON matching these fields:
            {{
                "customer_name": "string",
                "customer_age": number,
                "job_title": "string",
                ...
                // Include all fields as per the LoanApplication model
            }}
            """

            # Call Groq API
            completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",  # Using Mixtral model for better structured output
                temperature=0.1,  # Low temperature for more consistent output
                max_tokens=2000
            )

            # Extract and parse JSON from response
            response_text = completion.choices[0].message.content
            # Find JSON content between triple backticks if present
            if '```json' in response_text:
                json_str = response_text.split('```json')[1].split('```')[0]
            else:
                json_str = response_text
            
            structured_data = json.loads(json_str)
            return structured_data
            
        except Exception as e:
            raise ValueError(f"Failed to process natural language input: {str(e)}")

    @action(detail=False, methods=['post'])
    def process_text(self, request):
        """Endpoint to process natural language input and return structured data"""
        text = request.data.get('text')
        if not text:
            return Response(
                {'error': 'No text provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            structured_data = self.process_natural_language(text)
            return Response(structured_data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def create(self, request, *args, **kwargs):
        """Handle creation of new loan application"""
        # If only text is provided, process it first
        if 'original_input_text' in request.data and len(request.data) == 1:
            try:
                structured_data = self.process_natural_language(
                    request.data['original_input_text']
                )
                # Combine the original text with structured data
                data = {
                    'original_input_text': request.data['original_input_text'],
                    'structured_data': structured_data,
                    **structured_data  # Expand structured data into individual fields
                }
                serializer = self.get_serializer(data=data)
            except ValueError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class LoanAnalysisResultViewSet(viewsets.ModelViewSet):
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LoanAnalysisResultListSerializer
        return LoanAnalysisResultSerializer
    
    def get_queryset(self):
        return LoanAnalysisResult.objects.filter(
            loan_application__user=self.request.user
        )

    def generate_analysis(self, loan_application):
        """Generate analysis using Groq API based on loan application data"""
        try:
            # Convert loan application data to a detailed description
            app_data = LoanApplicationSerializer(loan_application).data
            
            # Prepare prompt for Groq API
            prompt = f"""
            Analyze the following loan application data and provide a comprehensive credit risk analysis.
            
            Loan Application Details:
            - Customer: {app_data['customer_name']}, Age: {app_data['customer_age']}
            - Job: {app_data['job_title']} at {app_data['company']}
            - Annual Income: ${app_data['annual_income']}
            - Credit Score: {app_data['credit_score']}
            - Loan Amount: ${app_data['loan_amount']}
            - Loan Purpose: {app_data['loan_purpose']}
            - Property Type: {app_data['property_type']}
            
            Additional Financial Information:
            - Total Assets: ${app_data['total_assets']}
            - Total Liabilities: ${app_data['total_liabilities']}
            - Monthly Savings: ${app_data['monthly_savings']}
            
            Format the output as valid JSON matching these fields:
            {{
                "risk_score": number (0-100),
                "approval_probability": number (0-100),
                "approval_recommendation": "string",
                "risk_factors": ["string"],
                // Include all fields as per the LoanAnalysisResult model
            }}
            """

            # Call Groq API
            completion = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="mixtral-8x7b-32768",
                temperature=0.2,
                max_tokens=2000
            )

            # Extract and parse JSON from response
            response_text = completion.choices[0].message.content
            if '```json' in response_text:
                json_str = response_text.split('```json')[1].split('```')[0]
            else:
                json_str = response_text
            
            analysis_data = json.loads(json_str)
            
            # Add loan application reference and customer info
            analysis_data.update({
                'loan_application': loan_application,
                'customer_name': loan_application.customer_name,
                'customer_age': loan_application.customer_age,
                'job_title': loan_application.job_title,
                'company': loan_application.company,
                'annual_income': loan_application.annual_income,
                'credit_score': loan_application.credit_score,
                'net_worth': loan_application.net_worth
            })
            
            return analysis_data
            
        except Exception as e:
            raise ValueError(f"Failed to generate analysis: {str(e)}")

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """Generate analysis for a loan application"""
        loan_application = self.get_object()
        
        try:
            analysis_data = self.generate_analysis(loan_application)
            serializer = LoanAnalysisResultSerializer(data=analysis_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

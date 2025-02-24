from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import Analysis
from .serializers import AnalysisSerializer
import os
import json
from supabase import create_client
from groq import Groq

# Initialize Supabase client
supabase = create_client(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_KEY')
)

class SupabaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        try:
            # Verify token with Supabase
            response = supabase.auth.get_user(token)
            user_data = response.user
            
            if not user_data:
                raise AuthenticationFailed('Invalid token')

            # Get or create Django user
            django_user, created = User.objects.get_or_create(
                username=user_data.email,
                defaults={
                    'email': user_data.email,
                    'is_active': True
                }
            )
            
            # Store the token in the request for later use
            request.auth = token
            return (django_user, token)
            
        except Exception as e:
            print(f'Authentication error: {str(e)}')
            raise AuthenticationFailed('Invalid token or authentication failed')

class AnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AnalysisSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Analysis.objects.filter(user=user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def analyze_loan(self, customer_input):
        """Analyze loan application and return structured data"""
        try:
            print("\n=== Starting loan analysis ===")
            print(f"Customer input: {customer_input}")
            
            groq_api_key = os.environ.get('GROQ_API_KEY')
            if not groq_api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            print("Found GROQ_API_KEY in environment")

            from groq import Groq
            client = Groq(api_key=groq_api_key)

            # Structured prompt to get detailed JSON response
            system_prompt = """You are an expert loan analysis system. Analyze the provided loan application data and return a detailed JSON response.
            You must ONLY return a valid JSON object matching this exact structure (do not include comments in output):

            {
              "summary": {
                "overall_assessment": "A detailed paragraph summarizing the loan application analysis in human-friendly terms",
                "key_strengths": [
                  "List of 2-3 key positive factors"
                ],
                "key_concerns": [
                  "List of 2-3 key risk factors or concerns"
                ],
                "recommendations": [
                  "List of 3-4 actionable recommendations for the applicant"
                ]
              },
              "credit_risk_analysis": {
                "risk_score": (number 0-100),
                "risk_factors": [(list of risk factor strings)],
                "approval_probability": (number 0-100),
                "approval_recommendation": ("Approved", "Denied", or "Manual Review")
              },
              "financial_metrics": {
                "debt_to_income_ratio": (calculated as total monthly debt / monthly income * 100),
                "loan_to_value_ratio": (calculated as loan amount / property value * 100),
                "credit_utilization": (from input or calculate),
                "savings_rate": (from input or calculate as monthly_savings / monthly_income * 100),
                "monthly_savings": (from input),
                "net_worth": (total_assets - total_liabilities),
                "total_assets": (from input),
                "total_liabilities": (from input)
              },
              "loan_metrics": {
                "monthly_payment": (calculated using loan amount, term, and interest rate),
                "total_interest_paid": (calculated over full loan term),
                "break_even_years": (calculated based on property appreciation),
                "early_payment_savings": (potential savings with 20% extra monthly payment)
              },
              "property_analysis": {
                "property_value_growth_5yr": (from input),
                "market_risk": ("Low", "Moderate", or "High", based on location and market factors),
                "property_tax_rate": (from input)
              },
              "economic_factors": {
                "economic_conditions_risk": ("Low", "Moderate", or "High"),
                "inflation_rate": (current rate from input),
                "interest_rate_trend": ("Increasing", "Stable", or "Decreasing")
              },
              "chart_data": {
                "debt_breakdown": {
                  "Car Loan": (monthly car payment),
                  "Mortgage": (calculated monthly mortgage),
                  "Credit Cards": (monthly credit card payments)
                },
                "income_vs_expenses": {
                  "Income": (monthly income),
                  "Expenses": (estimated monthly expenses),
                  "Savings": (monthly savings)
                },
                "net_worth_composition": {
                  "Assets": (total assets),
                  "Liabilities": (total liabilities)
                },
                "loan_amortization": [
                  {
                    "year": 1,
                    "principal_paid": (first year principal),
                    "interest_paid": (first year interest),
                    "remaining_balance": (end of year 1 balance)
                  },
                  {
                    "year": 5,
                    "principal_paid": (cumulative 5 year principal),
                    "interest_paid": (cumulative 5 year interest),
                    "remaining_balance": (end of year 5 balance)
                  },
                  {
                    "year": 10,
                    "principal_paid": (cumulative 10 year principal),
                    "interest_paid": (cumulative 10 year interest),
                    "remaining_balance": (end of year 10 balance)
                  }
                ]
              }
            }

            Make the overall_assessment engaging and easy to understand, focusing on:
            1. The applicant's financial health
            2. The loan's affordability
            3. Property and market conditions
            4. Final verdict on the loan

            Recommendations should be specific and actionable, such as:
            - Ways to improve approval chances
            - Suggestions for better loan terms
            - Financial management advice
            - Property-related considerations

            Calculate all metrics based on standard financial formulas:
            1. Monthly mortgage payment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
               where P = principal, r = monthly interest rate, n = total months
            2. DTI = Total Monthly Debt Payments / Monthly Income
            3. LTV = Loan Amount / Property Value
            4. Use market standards for risk assessment
            
            Return ONLY the JSON object, no other text or explanation."""

            user_prompt = f"""Please analyze this loan application and return ONLY a JSON response matching the specified format:

Customer Information:
{customer_input}

Remember: Return ONLY the JSON object, no other text."""

            print("\n=== Sending request to Groq API ===")
            try:
                completion = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.1,
                    max_tokens=2048,
                    top_p=1,
                    stream=False
                )
                print("Completion object:", completion)
                
                if not completion.choices:
                    raise ValueError("No choices in completion response")
                
                response_text = completion.choices[0].message.content.strip()
                print("\n=== Raw Response ===")
                print(response_text)
                
                # Try to find JSON in the response
                try:
                    # First try direct JSON parsing
                    analysis_json = json.loads(response_text)
                except json.JSONDecodeError:
                    print("Direct JSON parsing failed, trying to extract JSON")
                    # Try to extract JSON if there's any extra text
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        try:
                            analysis_json = json.loads(json_match.group())
                        except json.JSONDecodeError as e:
                            print(f"Failed to parse extracted JSON: {e}")
                            raise
                    else:
                        raise ValueError("No JSON object found in response")

                print("\n=== Parsed JSON ===")
                print(json.dumps(analysis_json, indent=2))

                # Validate required top-level fields
                required_fields = [
                    'summary',
                    'credit_risk_analysis',
                    'financial_metrics',
                    'loan_metrics',
                    'property_analysis',
                    'economic_factors',
                    'chart_data'
                ]
                
                missing_fields = [field for field in required_fields if field not in analysis_json]
                if missing_fields:
                    raise ValueError(f"Missing required fields in analysis: {', '.join(missing_fields)}")

                return analysis_json

            except Exception as api_error:
                print(f"\n=== API Error ===")
                print(f"Error type: {type(api_error)}")
                print(f"Error message: {str(api_error)}")
                raise ValueError(f"Groq API error: {str(api_error)}")

        except Exception as e:
            print(f"\n=== Analysis Error ===")
            print(f"Error type: {type(e)}")
            print(f"Error message: {str(e)}")
            import traceback
            print("Traceback:", traceback.format_exc())
            raise ValueError(f"Failed to analyze loan application: {str(e)}")

    def create(self, request, *args, **kwargs):
        try:
            # Print request data for debugging
            print("Request data:", request.data)
            
            # Validate required fields
            if not request.data:
                return Response({'error': 'No data provided'}, status=400)
                
            customer_input = request.data.get('customer_input', request.data.get('customerInput', ''))
            customer_phone = request.data.get('customer_phone', request.data.get('customerPhone', ''))
            
            if not customer_input or not customer_phone:
                return Response({
                    'error': 'Missing required fields',
                    'required': ['customer_input/customerInput', 'customer_phone/customerPhone'],
                    'received': request.data
                }, status=400)

            # Create analysis object
            analysis = Analysis.objects.create(
                user=request.user,
                customer_phone=customer_phone,
                customer_input=customer_input,
                analysis_result={}  # Initialize with empty dict
            )

            try:
                # Get analysis result
                analysis_result = self.analyze_loan(customer_input)
                
                # Store analysis result
                analysis.analysis_result = analysis_result
                analysis.save()

                # Return the complete analysis object with the result
                serializer = self.get_serializer(analysis)
                return Response(serializer.data, status=201)

            except Exception as e:
                print(f"Analysis error: {str(e)}")
                # If analysis fails, update status and return error
                analysis.analysis_result = {'error': str(e)}
                analysis.save()
                return Response({
                    'error': 'Failed to analyze loan application',
                    'detail': str(e)
                }, status=400)

        except Exception as e:
            print(f"Create error: {str(e)}")
            return Response({
                'error': 'Failed to create analysis',
                'detail': str(e)
            }, status=400)

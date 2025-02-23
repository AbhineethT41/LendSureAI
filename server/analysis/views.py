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
import requests
import json
from supabase import create_client

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
            user = supabase.auth.get_user(token)
            if not user:
                raise AuthenticationFailed('Invalid token')

            # Get or create Django user
            django_user, created = User.objects.get_or_create(
                username=user.user.email,
                defaults={'email': user.user.email}
            )
            
            return (django_user, None)
        except Exception as e:
            raise AuthenticationFailed('Invalid token')

class AnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AnalysisSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Admin users can see all analyses
            return Analysis.objects.all()
        return Analysis.objects.filter(user=user)  # Regular users see only their analyses

    def create(self, request, *args, **kwargs):
        try:
            # Add user to request data
            data = request.data.copy()
            data['user'] = request.user.id

            # Validate data
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)

            # Create the analysis
            instance = self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        try:
            # Validate required fields
            customer_input = self.request.data.get('customer_input')
            customer_phone = self.request.data.get('customer_phone')

            if not customer_input:
                raise ValueError('Customer information is required')
            if not customer_phone:
                raise ValueError('Customer phone number is required')

            # Initialize analysis result
            analysis_result = {}

            # Call Groq API if key is available
            groq_api_key = os.environ.get('GROQ_API_KEY')
            if groq_api_key:
                groq_api_url = "https://api.groq.com/openai/v1/chat/completions"
                
                headers = {
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                }

                data = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": customer_input}]
                }

                try:
                    response = requests.post(groq_api_url, headers=headers, json=data)
                    response.raise_for_status()
                    analysis_result = response.json()
                except requests.exceptions.RequestException as e:
                    print(f"Groq API error: {str(e)}")
                    analysis_result = {"error": "Failed to process analysis with Groq API"}

            # Save the analysis
            instance = serializer.save(
                user=self.request.user,
                customer_input=customer_input,
                customer_phone=customer_phone,
                analysis_result=analysis_result
            )
            
            return instance
        
        except Exception as e:
            raise ValueError(f"Failed to create analysis: {str(e)}")

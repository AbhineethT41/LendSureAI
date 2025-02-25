from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from analysis.models import Analysis
from unittest.mock import patch, MagicMock
import json

class TestAnalysisViewSet(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpass123'
        )
        self.valid_token = "valid_token"
        
        # Mock Supabase authentication
        self.auth_patcher = patch('analysis.views.supabase')
        self.mock_supabase = self.auth_patcher.start()
        mock_user = MagicMock()
        mock_user.email = self.user.email
        mock_response = MagicMock()
        mock_response.user = mock_user
        self.mock_supabase.auth.get_user.return_value = mock_response
        
        # Set authentication token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.valid_token}')
        
        self.sample_input = {
            "customer_input": {
                "customer_name": "John Doe",
                "personal_info": {
                    "age": 35,
                    "employment_status": "Employed"
                },
                "financial_info": {
                    "monthly_income": 8000,
                    "credit_score": 750
                },
                "loan_request": {
                    "amount": 300000,
                    "term_years": 30
                }
            },
            "customer_phone": "1234567890"
        }

    def tearDown(self):
        self.auth_patcher.stop()

    @patch('analysis.views.Groq')
    def test_create_analysis(self, mock_groq):
        # Mock Groq response
        mock_groq_instance = MagicMock()
        mock_groq_instance.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content=json.dumps({
                "summary": {"overall_assessment": "Good candidate"},
                "credit_risk_analysis": {"risk_score": 85}
            })))]
        )
        mock_groq.return_value = mock_groq_instance

        # Make request
        response = self.client.post('/api/analysis/', self.sample_input, format='json')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('analysis_result', response.data)
        self.assertEqual(response.data['customer_phone'], '1234567890')

    def test_list_analyses(self):
        # Create some test analyses
        Analysis.objects.create(
            user=self.user,
            customer_input=self.sample_input['customer_input'],
            customer_phone=self.sample_input['customer_phone'],
            analysis_result={"status": "approved"}
        )
        
        # Make request
        response = self.client.get('/api/analysis/')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['customer_phone'], '1234567890')

    def test_retrieve_analysis(self):
        # Create test analysis
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.sample_input['customer_input'],
            customer_phone=self.sample_input['customer_phone'],
            analysis_result={"status": "approved"}
        )
        
        # Make request
        response = self.client.get(f'/api/analysis/{analysis.id}/')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['customer_phone'], '1234567890')

    def test_unauthorized_access(self):
        # Remove authentication
        self.client.credentials()
        
        # Make request
        response = self.client.get('/api/analysis/')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('analysis.views.Groq')
    def test_invalid_input(self, mock_groq):
        # Make request with invalid input
        invalid_input = {
            "customer_input": {},
            "customer_phone": "invalid"
        }
        response = self.client.post('/api/analysis/', invalid_input, format='json')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_analysis(self):
        # Create test analysis
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.sample_input['customer_input'],
            customer_phone=self.sample_input['customer_phone'],
            analysis_result={"status": "approved"}
        )
        
        # Make delete request
        response = self.client.delete(f'/api/analysis/{analysis.id}/')
        
        # Assert response
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Analysis.objects.filter(id=analysis.id).exists())

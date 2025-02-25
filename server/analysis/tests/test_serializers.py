from django.test import TestCase
from django.contrib.auth.models import User
from analysis.models import Analysis
from analysis.serializers import AnalysisSerializer
import json

class TestAnalysisSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpass123'
        )
        
        self.analysis_data = {
            'customer_input': {
                'customer_name': 'John Doe',
                'personal_info': {
                    'age': 35,
                    'employment_status': 'Employed'
                },
                'financial_info': {
                    'monthly_income': 8000,
                    'credit_score': 750
                }
            },
            'customer_phone': '1234567890',
            'analysis_result': {
                'approval_status': 'approved',
                'risk_score': 85
            }
        }
        
        self.analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        self.serializer = AnalysisSerializer(instance=self.analysis)

    def test_contains_expected_fields(self):
        data = self.serializer.data
        expected_fields = {
            'id', 'user_email', 'customer_input', 'customer_phone',
            'analysis_result', 'created_at', 'updated_at',
            'customer_name', 'loan_amount', 'status'
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_customer_name_field(self):
        self.assertEqual(
            self.serializer.data['customer_name'],
            self.analysis_data['customer_input']['customer_name']
        )

    def test_user_email_field(self):
        self.assertEqual(self.serializer.data['user_email'], self.user.email)

    def test_customer_input_json_field(self):
        # Test with string input
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=json.dumps(self.analysis_data['customer_input']),
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        serializer = AnalysisSerializer(instance=analysis)
        self.assertEqual(
            serializer.data['customer_name'],
            self.analysis_data['customer_input']['customer_name']
        )

    def test_invalid_customer_input(self):
        # Test with invalid JSON
        invalid_data = {
            'user': self.user,
            'customer_input': 'invalid json',
            'customer_phone': '1234567890'
        }
        serializer = AnalysisSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())

    def test_missing_required_fields(self):
        invalid_data = {
            'user': self.user,
            'customer_input': self.analysis_data['customer_input']
            # missing customer_phone
        }
        serializer = AnalysisSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('customer_phone', serializer.errors)

    def test_read_only_fields(self):
        data = {
            'customer_input': self.analysis_data['customer_input'],
            'customer_phone': '9876543210',
            'user_email': 'another@example.com',  # should be read-only
            'analysis_result': {'status': 'denied'}  # should be read-only
        }
        serializer = AnalysisSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        
        # Create new instance
        analysis = serializer.save(user=self.user)
        
        # Verify read-only fields were not changed
        self.assertEqual(analysis.user.email, self.user.email)
        self.assertIsNone(analysis.analysis_result)  # Should not be set through serializer

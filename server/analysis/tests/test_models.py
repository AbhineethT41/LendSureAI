from django.test import TestCase
from django.contrib.auth.models import User
from analysis.models import Analysis
from unittest.mock import patch

class TestAnalysisModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.analysis_data = {
            'customer_input': {
                'customer_name': 'John Doe',
                'loan_amount': 250000,
                'credit_score': 750
            },
            'customer_phone': '1234567890',
            'analysis_result': {
                'approval_status': 'approved',
                'risk_score': 85
            }
        }

    def test_analysis_creation(self):
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        self.assertEqual(analysis.user, self.user)
        self.assertEqual(analysis.customer_phone, '1234567890')
        self.assertEqual(analysis.analysis_result['approval_status'], 'approved')
        self.assertEqual(analysis.analysis_result['risk_score'], 85)

    @patch('analysis.models.supabase')
    def test_analysis_save_with_supabase(self, mock_supabase):
        # Mock Supabase response
        mock_response = {'id': 'test_supabase_id'}
        mock_supabase.table().insert().execute.return_value = {'data': [mock_response]}
        
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        # Verify Supabase was called with correct data
        mock_supabase.table.assert_called_with('analyses')
        self.assertTrue(mock_supabase.table().insert().execute.called)
        
        # Verify Supabase ID was saved
        self.assertEqual(analysis.supabase_id, 'test_supabase_id')

    def test_analysis_str_method(self):
        analysis = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        expected_str = f'Analysis for {self.user.email} - {analysis.created_at}'
        self.assertEqual(str(analysis), expected_str)

    def test_analysis_ordering(self):
        # Create multiple analyses
        analysis1 = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        analysis2 = Analysis.objects.create(
            user=self.user,
            customer_input=self.analysis_data['customer_input'],
            customer_phone=self.analysis_data['customer_phone'],
            analysis_result=self.analysis_data['analysis_result']
        )
        
        # Verify ordering is by created_at in descending order
        analyses = Analysis.objects.all()
        self.assertEqual(analyses[0], analysis2)
        self.assertEqual(analyses[1], analysis1)

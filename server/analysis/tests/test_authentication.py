from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIRequestFactory
from unittest.mock import patch, MagicMock
from analysis.views import SupabaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

class TestSupabaseAuthentication(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.auth = SupabaseAuthentication()
        self.valid_token = "valid_token"
        self.invalid_token = "invalid_token"
        self.test_email = "test@example.com"

    @patch('analysis.views.supabase')
    def test_valid_authentication(self, mock_supabase):
        # Mock Supabase response
        mock_user = MagicMock()
        mock_user.email = self.test_email
        mock_response = MagicMock()
        mock_response.user = mock_user
        mock_supabase.auth.get_user.return_value = mock_response

        # Create request with valid token
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.valid_token}'

        # Test authentication
        user, token = self.auth.authenticate(request)
        
        # Assertions
        self.assertIsNotNone(user)
        self.assertEqual(user.email, self.test_email)
        self.assertEqual(token, self.valid_token)
        self.assertTrue(User.objects.filter(email=self.test_email).exists())

    @patch('analysis.views.supabase')
    def test_invalid_token(self, mock_supabase):
        # Mock Supabase response for invalid token
        mock_supabase.auth.get_user.side_effect = Exception("Invalid token")

        # Create request with invalid token
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.invalid_token}'

        # Test authentication with invalid token
        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_missing_auth_header(self):
        # Create request without auth header
        request = self.factory.get('/')
        
        # Test authentication without header
        result = self.auth.authenticate(request)
        self.assertIsNone(result)

    def test_invalid_auth_header_format(self):
        # Create request with invalid auth header format
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = self.valid_token  # Missing 'Bearer'
        
        # Test authentication with invalid header format
        result = self.auth.authenticate(request)
        self.assertIsNone(result)

    @patch('analysis.views.supabase')
    def test_supabase_error_handling(self, mock_supabase):
        # Mock Supabase to raise an exception
        mock_supabase.auth.get_user.side_effect = Exception("Supabase error")

        # Create request
        request = self.factory.get('/')
        request.META['HTTP_AUTHORIZATION'] = f'Bearer {self.valid_token}'

        # Test error handling
        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

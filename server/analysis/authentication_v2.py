from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
import jwt
import requests
from django.conf import settings
from django.core.cache import cache

User = get_user_model()

class SupabaseAuthentication(BaseAuthentication):
    """
    Custom authentication class for Supabase JWT tokens
    """
    
    def __init__(self):
        self.jwks = None
        self.jwks_url = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co/rest/v1/auth/jwks"

    def get_jwks(self):
        """
        Fetch and cache JWKS from Supabase
        """
        cached_jwks = cache.get('supabase_jwks')
        if cached_jwks:
            return cached_jwks

        response = requests.get(self.jwks_url)
        response.raise_for_status()
        self.jwks = response.json()
        
        # Cache JWKS for 1 hour
        cache.set('supabase_jwks', self.jwks, 3600)
        return self.jwks

    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, token).
        """
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None

        try:
            # Get the token from the Authorization header
            token = auth_header.split(' ')[1]
            
            # Get JWKS and verify token
            jwks = self.get_jwks()
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            
            # Find the key that matches the key ID in the token
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'n': key['n'],
                        'e': key['e']
                    }
                    break

            if not rsa_key:
                raise AuthenticationFailed('Invalid token key')

            # Decode and verify the token
            payload = jwt.decode(
                token,
                key=rsa_key,
                algorithms=['RS256'],
                audience='authenticated'
            )

            # Get or create user based on Supabase user ID
            user_id = payload['sub']
            email = payload.get('email', '')
            
            user, _ = User.objects.get_or_create(
                username=user_id,
                defaults={'email': email}
            )

            return (user, token)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')

"""
Firebase Authentication Middleware for Django.

Verifies Firebase ID tokens from the Authorization header and attaches
the user_id to the request object. Skips auth for public endpoints.
"""
import logging
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)

# Endpoints that don't require authentication
PUBLIC_PATHS = [
    '/api/auth/session/',
    '/api/health/',
]

# Lazy-init Firebase Admin SDK
_firebase_app = None


def _get_firebase_app():
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    try:
        import json as _json
        import firebase_admin
        from firebase_admin import credentials

        # Try to initialize with service account JSON file
        json_path = settings.FIREBASE_ADMIN_SDK_JSON_PATH
        json_raw = getattr(settings, 'FIREBASE_ADMIN_SDK_JSON', '')
        if json_path and json_path.strip():
            cred = credentials.Certificate(json_path)
        elif json_raw and json_raw.strip():
            # Raw JSON string (e.g. from Render env var)
            cred = credentials.Certificate(_json.loads(json_raw))
        else:
            # Fall back to application default credentials or project ID only
            cred = credentials.ApplicationDefault() if not settings.FIREBASE_PROJECT_ID else None

        options = {}
        if settings.FIREBASE_PROJECT_ID:
            options['projectId'] = settings.FIREBASE_PROJECT_ID
        if settings.FIREBASE_RTDB_URL:
            options['databaseURL'] = settings.FIREBASE_RTDB_URL

        try:
            _firebase_app = firebase_admin.get_app()
        except ValueError:
            if cred:
                _firebase_app = firebase_admin.initialize_app(cred, options)
            else:
                _firebase_app = firebase_admin.initialize_app(options=options)

        return _firebase_app
    except Exception as e:
        logger.warning(f"Firebase Admin SDK not initialized: {e}")
        return None


class FirebaseAuthMiddleware:
    """
    Django middleware that verifies Firebase ID tokens.

    Extracts the token from the Authorization header (Bearer <token>),
    verifies it, and attaches request.user_id and request.firebase_token.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip auth for public paths
        if any(request.path.startswith(p) for p in PUBLIC_PATHS):
            request.user_id = None
            request.firebase_token = None
            return self.get_response(request)

        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            request.user_id = None
            request.firebase_token = None
            return self.get_response(request)

        token = auth_header.split('Bearer ')[1].strip()

        try:
            app = _get_firebase_app()
            if app is None:
                # Firebase not configured — allow through in dev mode
                if settings.DEBUG:
                    request.user_id = 'dev-user'
                    request.firebase_token = None
                    return self.get_response(request)
                return JsonResponse(
                    {'error': 'Authentication service unavailable'},
                    status=503
                )

            from firebase_admin import auth
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            request.firebase_token = decoded_token
        except Exception as e:
            logger.warning(f"Firebase token verification failed: {e}")
            if settings.DEBUG:
                # In dev, allow through with a placeholder user
                request.user_id = 'dev-user'
                request.firebase_token = None
                return self.get_response(request)
            return JsonResponse(
                {'error': 'Invalid or expired authentication token'},
                status=401
            )

        return self.get_response(request)

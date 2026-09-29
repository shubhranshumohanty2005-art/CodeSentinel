"""
Core views — session creation, user profile, and health check.
"""
import logging
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import firestore_client as db

logger = logging.getLogger(__name__)


@api_view(['GET'])
def health_check(request):
    """
    GET /api/health/

    Deep health check — verifies backend, Redis, and Firebase connectivity.
    Does not require authentication.

    Query params:
        ?deep=true  — run full dependency checks (default: true)

    Returns 200 with per-service status. The overall status is:
        - "healthy"  — all dependencies reachable
        - "degraded" — app is up but one or more dependencies are down
    """
    import time
    from datetime import datetime, timezone
    from django.conf import settings

    checks = {}
    deep = request.query_params.get('deep', 'true').lower() != 'false'

    # ── Redis ─────────────────────────────────────────
    if deep:
        try:
            import redis
            start = time.time()
            r = redis.from_url(settings.REDIS_URL, socket_connect_timeout=3)
            r.ping()
            latency_ms = round((time.time() - start) * 1000, 1)
            checks['redis'] = {'status': 'ok', 'latency_ms': latency_ms}
        except Exception as e:
            logger.warning(f"Health check — Redis unreachable: {e}")
            checks['redis'] = {'status': 'error', 'message': str(e)}

    # ── Firebase Admin SDK ────────────────────────────
    if deep:
        try:
            from apps.core.firebase_auth import _get_firebase_app
            start = time.time()
            app = _get_firebase_app()
            latency_ms = round((time.time() - start) * 1000, 1)
            if app:
                checks['firebase'] = {'status': 'ok', 'latency_ms': latency_ms}
            else:
                checks['firebase'] = {'status': 'not_configured'}
        except Exception as e:
            logger.warning(f"Health check — Firebase error: {e}")
            checks['firebase'] = {'status': 'error', 'message': str(e)}

    # ── Overall ───────────────────────────────────────
    all_ok = all(
        c.get('status') in ('ok', 'not_configured')
        for c in checks.values()
    )

    return Response({
        'status': 'healthy' if all_ok else 'degraded',
        'service': 'codesentinel-backend',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'checks': checks,
    })


@api_view(['POST'])
def create_session(request):
    """
    POST /api/auth/session/

    Receives Firebase ID token and GitHub access token from the frontend.
    Verifies the ID token, encrypts and stores the GitHub token in Firestore,
    and creates/updates the user profile.

    Body: { "firebase_token": "...", "github_token": "...", "github_login": "..." }
    """
    firebase_token = request.data.get('firebase_token', '')
    github_token = request.data.get('github_token', '')
    github_login = request.data.get('github_login', '')

    if not firebase_token:
        return Response({'error': 'firebase_token is required'}, status=400)

    # Verify the Firebase ID token
    try:
        from apps.core.firebase_auth import _get_firebase_app
        app = _get_firebase_app()

        if app:
            from firebase_admin import auth
            decoded = auth.verify_id_token(firebase_token)
            uid = decoded['uid']
        else:
            # Dev fallback
            uid = 'dev-user'
    except Exception as e:
        logger.warning(f"Token verification failed in session creation: {e}")
        return Response({'error': 'Invalid Firebase token'}, status=401)

    # Encrypt and store GitHub token
    encrypted_token = db.encrypt_github_token(github_token) if github_token else ''

    user_data = {
        'githubLogin': github_login,
        'githubTokenEncrypted': encrypted_token,
    }

    db.create_or_update_user(uid, user_data)

    return Response({
        'uid': uid,
        'githubLogin': github_login,
        'message': 'Session created successfully',
    })


@api_view(['GET'])
def get_current_user(request):
    """
    GET /api/auth/me/

    Returns the current user's profile from Firestore.
    Requires a valid Firebase ID token in the Authorization header.
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    user = db.get_user(uid)
    if not user:
        return Response({'error': 'User not found'}, status=404)

    # Don't return the encrypted token
    user.pop('githubTokenEncrypted', None)

    return Response({
        'uid': uid,
        **user,
    })

"""
Data management views — download, delete, disconnect, consent recording.

Business logic is intentionally thin: parse request → call firestore_client → return response.
"""
import logging
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.core import firestore_client as db

logger = logging.getLogger(__name__)


@api_view(['GET'])
def download_my_data(request):
    """
    GET /api/auth/data/download/

    Returns all stored data for the authenticated user as JSON.
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    user_profile = db.get_user(uid) or {}
    # Remove encrypted token from export
    user_profile.pop('githubTokenEncrypted', None)

    repos = db.get_user_repos(uid)
    consent_records = db.get_consent_records(uid)

    return Response({
        'exportedAt': datetime.utcnow().isoformat(),
        'uid': uid,
        'profile': user_profile,
        'connectedRepos': repos,
        'consentRecords': consent_records,
    })


@api_view(['DELETE'])
def delete_my_account(request):
    """
    DELETE /api/auth/data/delete/

    Deletes all user data from Firestore (profile, repos, analysis results)
    and marks the account for Firebase Auth deletion.
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    try:
        db.delete_user_data(uid)

        # Attempt to delete Firebase Auth user
        try:
            from apps.core.firebase_auth import _get_firebase_app
            app = _get_firebase_app()
            if app:
                from firebase_admin import auth
                auth.delete_user(uid)
        except Exception as e:
            logger.warning(f"Could not delete Firebase Auth user {uid}: {e}")

        return Response({'message': 'Account and data deleted successfully.'})
    except Exception as e:
        logger.error(f"Failed to delete user data for {uid}: {e}")
        return Response({'error': 'Deletion failed. Please try again or contact support.'}, status=500)


@api_view(['POST'])
def disconnect_github(request):
    """
    POST /api/auth/data/disconnect-github/

    Removes the stored (encrypted) GitHub token from Firestore.
    The user must re-authenticate to reconnect.
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    db.create_or_update_user(uid, {'githubTokenEncrypted': '', 'githubLogin': ''})
    return Response({'message': 'GitHub disconnected. Token removed.'})


@api_view(['POST'])
def save_consent(request):
    """
    POST /api/auth/data/consent/

    Stores a consent record (timestamp, policy version, choices) in Firestore
    for the authenticated user.

    Body: { "essential": true, "functional": true, "analytics": false, "version": "1.0.0", "timestamp": "..." }
    """
    uid = getattr(request, 'user_id', None)
    if not uid:
        return Response({'error': 'Not authenticated'}, status=401)

    consent_data = {
        'essential': request.data.get('essential', True),
        'functional': request.data.get('functional', False),
        'analytics': request.data.get('analytics', False),
        'policyVersion': request.data.get('version', ''),
        'timestamp': request.data.get('timestamp', datetime.utcnow().isoformat()),
    }

    db.save_consent_record(uid, consent_data)
    return Response({'message': 'Consent recorded.'})

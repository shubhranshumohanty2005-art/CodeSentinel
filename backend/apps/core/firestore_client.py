"""
Firestore client wrapper — singleton access to Firestore and Realtime Database.

Provides helper methods for common operations on the CodeSentinel data model.
"""
import logging
import json
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)

_firestore_client = None
_rtdb_ref = None


def _get_firestore_client():
    """Get or create a Firestore client singleton."""
    global _firestore_client
    if _firestore_client is not None:
        return _firestore_client

    try:
        from apps.core.firebase_auth import _get_firebase_app
        _get_firebase_app()  # Ensure Firebase is initialized
        from firebase_admin import firestore
        _firestore_client = firestore.client()
        return _firestore_client
    except Exception as e:
        logger.warning(f"Firestore client not available: {e}")
        return None


def _get_rtdb_ref():
    """Get or create a Realtime Database reference."""
    global _rtdb_ref
    if _rtdb_ref is not None:
        return _rtdb_ref

    try:
        from apps.core.firebase_auth import _get_firebase_app
        _get_firebase_app()
        from firebase_admin import db
        _rtdb_ref = db.reference()
        return _rtdb_ref
    except Exception as e:
        logger.warning(f"RTDB reference not available: {e}")
        return None


# ── Firestore Operations ──────────────────────────────────────────

def get_user(uid):
    """Get a user document from Firestore."""
    db = _get_firestore_client()
    if not db:
        return None
    doc = db.collection('users').document(uid).get()
    return doc.to_dict() if doc.exists else None


def create_or_update_user(uid, data):
    """Create or update a user document in Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['updatedAt'] = datetime.utcnow().isoformat()
    db.collection('users').document(uid).set(data, merge=True)
    return True


def get_user_repos(uid):
    """Get all connected repos for a user."""
    db = _get_firestore_client()
    if not db:
        return []
    docs = db.collection('users').document(uid).collection('repos').stream()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]


def connect_repo(uid, repo_id, repo_data):
    """Connect a repo to a user's account."""
    db = _get_firestore_client()
    if not db:
        return False
    repo_data['connectedAt'] = datetime.utcnow().isoformat()
    db.collection('users').document(uid).collection('repos').document(repo_id).set(repo_data)
    return True


def disconnect_repo(uid, repo_id):
    """Disconnect a repo from a user's account."""
    db = _get_firestore_client()
    if not db:
        return False
    db.collection('users').document(uid).collection('repos').document(repo_id).delete()
    return True


def delete_user_data(uid):
    """Delete a user's profile and all subcollections from Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    
    # Recursively delete subcollections
    def delete_collection(coll_ref):
        for doc in coll_ref.stream():
            # Recursively delete subcollections of this doc
            for sub_coll in doc.reference.collections():
                delete_collection(sub_coll)
            doc.reference.delete()

    user_ref = db.collection('users').document(uid)
    for sub_coll in user_ref.collections():
        delete_collection(sub_coll)
    
    # Delete the user document itself
    user_ref.delete()
    return True


def save_consent_record(uid, data):
    """Save a consent record for the user."""
    db = _get_firestore_client()
    if not db:
        return False
    # Use timestamp as document ID to keep a history
    doc_id = data.get('timestamp', datetime.utcnow().isoformat())
    db.collection('users').document(uid).collection('consent_records').document(doc_id).set(data)
    return True


def get_consent_records(uid):
    """Get all consent records for a user."""
    db = _get_firestore_client()
    if not db:
        return []
    docs = db.collection('users').document(uid).collection('consent_records').order_by('timestamp', direction='DESCENDING').stream()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]


def save_pr_review(repo_id, pr_number, data):
    """Save a PR review report to Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['createdAt'] = datetime.utcnow().isoformat()
    db.collection('repos').document(repo_id).collection('pr_reviews').document(str(pr_number)).set(data)
    return True


def get_pr_review(repo_id, pr_number):
    """Get a PR review report from Firestore."""
    db = _get_firestore_client()
    if not db:
        return None
    doc = db.collection('repos').document(repo_id).collection('pr_reviews').document(str(pr_number)).get()
    return doc.to_dict() if doc.exists else None


def save_docs(repo_id, doc_id, data):
    """Save generated docs to Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['createdAt'] = datetime.utcnow().isoformat()
    db.collection('repos').document(repo_id).collection('docs').document(doc_id).set(data)
    return True


def save_triage(repo_id, issue_number, data):
    """Save triage results to Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['createdAt'] = datetime.utcnow().isoformat()
    db.collection('repos').document(repo_id).collection('triage').document(str(issue_number)).set(data)
    return True


def save_test(repo_id, test_id, data):
    """Save generated tests to Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['createdAt'] = datetime.utcnow().isoformat()
    db.collection('repos').document(repo_id).collection('tests').document(test_id).set(data)
    return True


def save_health_report(repo_id, report_id, data):
    """Save a repo health report to Firestore."""
    db = _get_firestore_client()
    if not db:
        return False
    data['createdAt'] = datetime.utcnow().isoformat()
    db.collection('repos').document(repo_id).collection('health_reports').document(report_id).set(data)
    return True


def get_latest_health_report(repo_id):
    """Get the most recent health report for a repo."""
    db = _get_firestore_client()
    if not db:
        return None
    docs = (db.collection('repos').document(repo_id)
            .collection('health_reports')
            .order_by('createdAt', direction='DESCENDING')
            .limit(1)
            .stream())
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None


def get_github_token(uid):
    """Get the user's encrypted GitHub token from Firestore and decrypt it."""
    user = get_user(uid)
    if not user or 'githubTokenEncrypted' not in user:
        return None

    encrypted = user['githubTokenEncrypted']
    key = settings.FIELD_ENCRYPTION_KEY
    if not key:
        # If no encryption key, assume token is stored in plaintext (dev mode)
        return encrypted

    try:
        from cryptography.fernet import Fernet
        f = Fernet(key.encode() if isinstance(key, str) else key)
        return f.decrypt(encrypted.encode() if isinstance(encrypted, str) else encrypted).decode()
    except Exception as e:
        logger.error(f"Failed to decrypt GitHub token: {e}")
        return None


def encrypt_github_token(token):
    """Encrypt a GitHub token for storage."""
    key = settings.FIELD_ENCRYPTION_KEY
    if not key:
        return token  # Store in plaintext in dev mode

    try:
        from cryptography.fernet import Fernet
        f = Fernet(key.encode() if isinstance(key, str) else key)
        return f.encrypt(token.encode()).decode()
    except Exception as e:
        logger.error(f"Failed to encrypt GitHub token: {e}")
        return token


# ── Realtime Database Operations ──────────────────────────────────

def update_job_status(repo_id, job_id, status, percent=0, message=None):
    """Update job progress in Realtime Database."""
    ref = _get_rtdb_ref()
    if not ref:
        logger.warning("RTDB not available, skipping job status update")
        return

    data = {
        'status': status,
        'percent': percent,
        'updatedAt': datetime.utcnow().isoformat(),
    }
    if message:
        data['message'] = message

    try:
        ref.child(f'job_status/{repo_id}/{job_id}').update(data)
    except Exception as e:
        logger.warning(f"Failed to update job status in RTDB: {e}")


def clear_job_status(repo_id, job_id):
    """Clear a job status node from Realtime Database after completion."""
    ref = _get_rtdb_ref()
    if not ref:
        return

    try:
        ref.child(f'job_status/{repo_id}/{job_id}').delete()
    except Exception as e:
        logger.warning(f"Failed to clear job status from RTDB: {e}")

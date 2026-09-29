"""
Custom exception handler for DRF — returns consistent JSON error responses.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """Handle exceptions and return consistent JSON responses."""
    response = exception_handler(exc, context)

    if response is not None:
        response.data = {
            'error': True,
            'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
            'status_code': response.status_code,
        }
    else:
        logger.exception(f"Unhandled exception: {exc}")
        response = Response(
            {
                'error': True,
                'message': 'An internal server error occurred.',
                'status_code': 500,
            },
            status=500,
        )

    return response

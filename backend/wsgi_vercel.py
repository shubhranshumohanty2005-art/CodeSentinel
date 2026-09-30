import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codesentinel.settings")

# Get the WSGI application
from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()

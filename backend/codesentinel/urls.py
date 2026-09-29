"""
CodeSentinel URL Configuration
"""
from django.urls import path, include
from apps.core.views import health_check

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('api/auth/', include('apps.core.urls')),
    path('api/pr-review/', include('apps.pr_review.urls')),
    path('api/docs/', include('apps.docs_generator.urls')),
    path('api/bug-triage/', include('apps.bug_triage.urls')),
    path('api/test-scaffolding/', include('apps.test_scaffolding.urls')),
    path('api/github/', include('apps.github_integration.urls')),
    path('api/agents/', include('apps.agents.urls')),
]

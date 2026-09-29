"""Agents URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('repo-health/run/', views.run_health_agent_view, name='run_health_agent'),
    path('repo-health/report/<str:repo_id>/', views.get_health_report_view, name='get_health_report'),
]

"""Bug Triage URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_issue_view, name='analyze_issue'),
    path('apply-labels/', views.apply_labels_view, name='apply_labels'),
]

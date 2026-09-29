"""Test Scaffolding URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_tests_view, name='generate_tests'),
    path('commit/', views.commit_test_view, name='commit_test'),
]

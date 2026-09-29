"""Docs Generator URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_docs_view, name='generate_docs'),
    path('commit/', views.commit_docs_view, name='commit_docs'),
]

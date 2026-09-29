"""
Core app URL configuration — auth session endpoint.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('session/', views.create_session, name='create_session'),
    path('me/', views.get_current_user, name='get_current_user'),
]

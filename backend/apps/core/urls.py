"""
Core app URL configuration — auth session endpoint.
"""
from django.urls import path
from . import views
from . import data_views

urlpatterns = [
    path('session/', views.create_session, name='create_session'),
    path('me/', views.get_current_user, name='get_current_user'),
    path('data/download/', data_views.download_my_data, name='download_my_data'),
    path('data/delete/', data_views.delete_my_account, name='delete_my_account'),
    path('data/disconnect-github/', data_views.disconnect_github, name='disconnect_github'),
    path('data/consent/', data_views.save_consent, name='save_consent'),
]

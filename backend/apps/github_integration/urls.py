"""GitHub integration URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('repos/', views.list_repos, name='list_repos'),
    path('repos/connect/', views.connect_repo, name='connect_repo'),
    path('repos/disconnect/', views.disconnect_repo, name='disconnect_repo'),
]

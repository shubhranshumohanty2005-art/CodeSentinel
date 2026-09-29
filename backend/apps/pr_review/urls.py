"""PR Review URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_pr_view, name='analyze_pr'),
    path('post-to-github/', views.post_to_github_view, name='post_pr_to_github'),
    path('report/<str:repo_id>/<int:pr_number>/', views.get_report_view, name='get_pr_report'),
]

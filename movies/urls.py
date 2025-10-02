"""
URL patterns for movies app - template views.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('movies/', views.movie_list_view, name='movie_list'),
    path('movies/<int:pk>/', views.movie_detail_view, name='movie_detail'),
    path('admin/upload/', views.admin_upload_view, name='admin_upload'),
]

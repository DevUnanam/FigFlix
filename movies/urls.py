"""
URL patterns for movies app - template views.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('home/', views.home_view, name='home'),
    path('movies/', views.movie_list_view, name='movie_list'),
    path('movies/<int:pk>/', views.movie_detail_view, name='movie_detail'),
    path('upload/', views.admin_upload_view, name='admin_upload'),
    path('manage-movies/', views.manage_movies_view, name='manage_movies'),
]

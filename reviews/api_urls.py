"""
API URL patterns for reviews app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Review CRUD endpoints
    path('', api_views.create_review_view, name='api_create_review'),
    path('<int:pk>/', api_views.update_review_view, name='api_update_review'),
    path('<int:pk>/delete/', api_views.delete_review_view, name='api_delete_review'),

    # Review query endpoints
    path('movie/<int:movie_id>/', api_views.movie_reviews_view, name='api_movie_reviews'),
    path('movie/<int:movie_id>/average/', api_views.movie_average_rating_view, name='api_movie_average_rating'),
    path('my-reviews/', api_views.user_reviews_view, name='api_user_reviews'),
]

"""
API URL patterns for movies app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Genre endpoints
    path('genres/', api_views.genre_list_view, name='api_genre_list'),
    path('genres/sync/', api_views.sync_genres_view, name='api_sync_genres'),

    # Local movie endpoints
    path('', api_views.MovieListView.as_view(), name='api_movie_list'),
    path('<int:pk>/', api_views.MovieDetailView.as_view(), name='api_movie_detail'),
    path('create/', api_views.MovieCreateView.as_view(), name='api_movie_create'),

    # TMDb integration endpoints
    path('tmdb/search/', api_views.tmdb_search_view, name='api_tmdb_search'),
    path('tmdb/popular/', api_views.tmdb_popular_view, name='api_tmdb_popular'),
    path('tmdb/top-rated/', api_views.tmdb_top_rated_view, name='api_tmdb_top_rated'),
    path('tmdb/discover/', api_views.tmdb_discover_view, name='api_tmdb_discover'),
    path('tmdb/<int:tmdb_id>/', api_views.tmdb_movie_detail_view, name='api_tmdb_movie_detail'),
    path('tmdb/<int:tmdb_id>/import/', api_views.import_from_tmdb_view, name='api_tmdb_import'),

    # Watch history endpoints
    path('watch-history/', api_views.get_watch_history_view, name='api_watch_history'),
    path('watch-history/add/', api_views.add_to_watch_history_view, name='api_add_watch_history'),
]

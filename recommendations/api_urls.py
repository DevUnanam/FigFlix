"""
API URL patterns for recommendations app.
"""
from django.urls import path
from . import api_views

urlpatterns = [
    # Recommendation endpoints
    path('', api_views.get_recommendations_view, name='api_recommendations'),
    path('similar/<int:movie_id>/', api_views.get_similar_movies_view, name='api_similar_movies'),

    # Chatbot endpoints
    path('chat/', api_views.chat_with_bot_view, name='api_chat'),
    path('chat/history/', api_views.get_chat_history_view, name='api_chat_history'),
    path('chat/history/clear/', api_views.clear_chat_history_view, name='api_clear_chat_history'),
]

"""
API URL patterns for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import api_views

urlpatterns = [
    # Authentication endpoints
    path('register/', api_views.RegisterAPIView.as_view(), name='api_register'),
    path('login/', TokenObtainPairView.as_view(), name='api_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),

    # User endpoints
    path('user/', api_views.current_user_view, name='api_current_user'),
    path('preferences/', api_views.get_preferences_view, name='api_get_preferences'),
    path('preferences/update/', api_views.update_preferences_view, name='api_update_preferences'),
]

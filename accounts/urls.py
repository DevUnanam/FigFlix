"""
URL patterns for accounts app - template views.
"""
from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('register/user/', views.register_user_view, name='register_user'),
    path('register/admin/', views.register_admin_view, name='register_admin'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('profile/', views.profile_view, name='profile'),
]

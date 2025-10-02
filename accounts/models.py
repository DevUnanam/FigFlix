"""
User models for authentication and preferences.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model with role-based access and preferences.
    """
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)

    # Require email for authentication
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_admin_user(self):
        """Check if user has admin role"""
        return self.role == 'admin'


class UserPreference(models.Model):
    """
    Store user preferences for movie recommendations.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')

    # Movie preferences
    favorite_genres = models.JSONField(default=list, blank=True)
    favorite_actors = models.JSONField(default=list, blank=True)
    preferred_languages = models.JSONField(default=list, blank=True)

    # Additional preferences
    min_rating = models.FloatField(default=0.0)
    preferred_release_year_start = models.IntegerField(null=True, blank=True)
    preferred_release_year_end = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"

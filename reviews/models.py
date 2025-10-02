"""
Models for reviews and ratings.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from movies.models import Movie

User = get_user_model()


class Review(models.Model):
    """
    User reviews for movies with ratings.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    review_text = models.TextField(blank=True, help_text="Optional review text")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.movie.title} ({self.rating}★)"

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'movie']  # One review per user per movie

"""
Models for movies app - stores both TMDb movies and admin-uploaded movies.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Genre(models.Model):
    """
    Movie genres - synced with TMDb genre list.
    """
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Movie(models.Model):
    """
    Movie model - can be from TMDb API or uploaded by admin.
    """
    SOURCE_CHOICES = (
        ('tmdb', 'TMDb API'),
        ('admin', 'Admin Upload'),
    )

    # Basic information
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    release_year = models.IntegerField(null=True, blank=True)
    runtime = models.IntegerField(null=True, blank=True, help_text="Runtime in minutes")

    # TMDb specific fields
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True)
    tmdb_rating = models.FloatField(null=True, blank=True)
    tmdb_vote_count = models.IntegerField(null=True, blank=True)

    # Media files
    poster = models.ImageField(upload_to='posters/', null=True, blank=True)
    poster_url = models.URLField(max_length=500, blank=True, help_text="TMDb poster URL")
    backdrop_url = models.URLField(max_length=500, blank=True, help_text="TMDb backdrop URL")
    trailer_url = models.URLField(max_length=500, blank=True, help_text="YouTube trailer URL")

    # Categorization
    genres = models.ManyToManyField(Genre, related_name='movies', blank=True)
    actors = models.JSONField(default=list, blank=True, help_text="List of actor names")
    director = models.CharField(max_length=255, blank=True)
    language = models.CharField(max_length=50, blank=True)

    # Source tracking
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='admin')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='uploaded_movies')

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.release_year})"

    @property
    def average_rating(self):
        """Calculate average user rating"""
        from reviews.models import Review
        reviews = self.reviews.all()
        if reviews.exists():
            return reviews.aggregate(models.Avg('rating'))['rating__avg']
        return self.tmdb_rating or 0.0

    @property
    def poster_image_url(self):
        """Get poster URL - prefer uploaded image, fallback to TMDb"""
        if self.poster:
            return self.poster.url
        return self.poster_url

    class Meta:
        ordering = ['-created_at']


class WatchHistory(models.Model):
    """
    Track which movies users have watched.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history')
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='watchers')
    watched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} watched {self.movie.title}"

    class Meta:
        ordering = ['-watched_at']
        unique_together = ['user', 'movie']

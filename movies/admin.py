"""
Admin configuration for movies app.
"""
from django.contrib import admin
from .models import Movie, Genre, WatchHistory


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    """Genre admin"""
    list_display = ('name', 'tmdb_id')
    search_fields = ('name',)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    """Movie admin with rich features"""
    list_display = ('title', 'release_year', 'source', 'average_rating', 'created_at')
    list_filter = ('source', 'release_year', 'genres', 'language')
    search_fields = ('title', 'description', 'director')
    filter_horizontal = ('genres',)
    readonly_fields = ('created_at', 'updated_at', 'average_rating')

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'release_year', 'runtime', 'language')
        }),
        ('Media', {
            'fields': ('poster', 'poster_url', 'backdrop_url', 'trailer_url')
        }),
        ('Categorization', {
            'fields': ('genres', 'actors', 'director')
        }),
        ('TMDb Data', {
            'fields': ('tmdb_id', 'tmdb_rating', 'tmdb_vote_count'),
            'classes': ('collapse',)
        }),
        ('Source', {
            'fields': ('source', 'uploaded_by')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'average_rating'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        """Set uploaded_by to current user if admin upload"""
        if not change and obj.source == 'admin':
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    """Watch history admin"""
    list_display = ('user', 'movie', 'watched_at')
    list_filter = ('watched_at',)
    search_fields = ('user__username', 'movie__title')
    date_hierarchy = 'watched_at'

"""
Admin configuration for reviews app.
"""
from django.contrib import admin
from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    """Review admin"""
    list_display = ('user', 'movie', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'movie__title', 'review_text')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

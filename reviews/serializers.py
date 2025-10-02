"""
Serializers for reviews app.
"""
from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    movie_title = serializers.CharField(source='movie.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_username', 'movie', 'movie_title',
            'rating', 'review_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating reviews"""
    class Meta:
        model = Review
        fields = ['movie', 'rating', 'review_text']

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

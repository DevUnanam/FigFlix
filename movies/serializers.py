"""
Serializers for movies app.
"""
from rest_framework import serializers
from .models import Movie, Genre, WatchHistory


class GenreSerializer(serializers.ModelSerializer):
    """Serializer for genres"""
    class Meta:
        model = Genre
        fields = ['id', 'name', 'tmdb_id']


class MovieSerializer(serializers.ModelSerializer):
    """Serializer for movies"""
    genres = GenreSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    poster_image_url = serializers.ReadOnlyField()

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'release_year', 'runtime',
            'poster_image_url', 'poster_url', 'backdrop_url', 'trailer_url',
            'genres', 'actors', 'director', 'language',
            'tmdb_id', 'tmdb_rating', 'tmdb_vote_count', 'average_rating',
            'source', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'source', 'average_rating']


class MovieCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating movies (admin uploads)"""
    genre_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Movie
        fields = [
            'title', 'description', 'release_year', 'runtime',
            'poster', 'trailer_url', 'genre_ids', 'actors', 'director', 'language'
        ]

    def create(self, validated_data):
        genre_ids = validated_data.pop('genre_ids', [])
        movie = Movie.objects.create(**validated_data, source='admin')

        # Add genres
        if genre_ids:
            genres = Genre.objects.filter(id__in=genre_ids)
            movie.genres.set(genres)

        return movie


class WatchHistorySerializer(serializers.ModelSerializer):
    """Serializer for watch history"""
    movie = MovieSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WatchHistory
        fields = ['id', 'movie', 'movie_id', 'watched_at']
        read_only_fields = ['watched_at']

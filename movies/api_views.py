"""
API views for movies app.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q, Avg
from .models import Movie, Genre, WatchHistory
from .serializers import (
    MovieSerializer, MovieCreateSerializer, GenreSerializer, WatchHistorySerializer
)
from .tmdb_service import tmdb_service


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission: admins can write, others can only read.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


# Genre endpoints
@api_view(['GET'])
def genre_list_view(request):
    """
    Get all genres.
    GET /api/movies/genres/
    """
    genres = Genre.objects.all()
    serializer = GenreSerializer(genres, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_genres_view(request):
    """
    Sync genres from TMDb API (admin only).
    POST /api/movies/genres/sync/
    """
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    tmdb_genres = tmdb_service.get_genres()
    created_count = 0

    for genre_data in tmdb_genres:
        genre, created = Genre.objects.get_or_create(
            tmdb_id=genre_data['id'],
            defaults={'name': genre_data['name']}
        )
        if created:
            created_count += 1

    return Response({
        'message': f'Synced {created_count} new genres',
        'total_genres': Genre.objects.count()
    })


# Movie endpoints
class MovieListView(generics.ListAPIView):
    """
    List all movies (both admin-uploaded and from database).
    GET /api/movies/
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Movie.objects.all()

        # Filter by genre
        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genres__name__icontains=genre)

        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(release_year=year)

        # Filter by search query
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(director__icontains=search)
            )

        return queryset.distinct()


class MovieDetailView(generics.RetrieveAPIView):
    """
    Get movie details.
    GET /api/movies/{id}/
    """
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]


class MovieCreateView(generics.CreateAPIView):
    """
    Create new movie (admin only).
    POST /api/movies/create/
    """
    queryset = Movie.objects.all()
    serializer_class = MovieCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(uploaded_by=self.request.user)


# TMDb API endpoints
@api_view(['GET'])
def tmdb_search_view(request):
    """
    Search TMDb for movies.
    GET /api/movies/tmdb/search/?q=Inception&page=1
    """
    query = request.query_params.get('q', '')
    page = int(request.query_params.get('page', 1))

    if not query:
        return Response({'error': 'Search query required'}, status=status.HTTP_400_BAD_REQUEST)

    results = tmdb_service.search_movies(query, page)
    return Response(results)


@api_view(['GET'])
def tmdb_popular_view(request):
    """
    Get popular movies from TMDb.
    GET /api/movies/tmdb/popular/?page=1
    """
    page = int(request.query_params.get('page', 1))
    results = tmdb_service.get_popular_movies(page)
    return Response(results)


@api_view(['GET'])
def tmdb_top_rated_view(request):
    """
    Get top rated movies from TMDb.
    GET /api/movies/tmdb/top-rated/?page=1
    """
    page = int(request.query_params.get('page', 1))
    results = tmdb_service.get_top_rated_movies(page)
    return Response(results)


@api_view(['GET'])
def tmdb_movie_detail_view(request, tmdb_id):
    """
    Get movie details from TMDb.
    GET /api/movies/tmdb/{tmdb_id}/
    """
    movie_data = tmdb_service.get_movie_details(tmdb_id)
    if not movie_data:
        return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get videos and credits
    videos = tmdb_service.get_movie_videos(tmdb_id)
    credits = tmdb_service.get_movie_credits(tmdb_id)

    # Add trailer URL
    if videos:
        movie_data['trailer_url'] = f"https://www.youtube.com/watch?v={videos[0]['key']}"

    # Add cast
    movie_data['actors'] = [actor['name'] for actor in credits['cast'][:10]]

    # Add director
    directors = [crew['name'] for crew in credits['crew'] if crew['job'] == 'Director']
    movie_data['director'] = directors[0] if directors else ''

    return Response(movie_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_from_tmdb_view(request, tmdb_id):
    """
    Import movie from TMDb to local database (admin only).
    POST /api/movies/tmdb/{tmdb_id}/import/
    """
    if request.user.role != 'admin':
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

    # Check if already imported
    if Movie.objects.filter(tmdb_id=tmdb_id).exists():
        return Response({'error': 'Movie already imported'}, status=status.HTTP_400_BAD_REQUEST)

    # Fetch from TMDb
    movie_data = tmdb_service.get_movie_details(tmdb_id)
    if not movie_data:
        return Response({'error': 'Movie not found on TMDb'}, status=status.HTTP_404_NOT_FOUND)

    # Get additional data
    videos = tmdb_service.get_movie_videos(tmdb_id)
    credits = tmdb_service.get_movie_credits(tmdb_id)

    # Create movie
    movie = Movie.objects.create(
        title=movie_data['title'],
        description=movie_data['description'],
        release_year=movie_data['release_year'],
        runtime=movie_data['runtime'],
        tmdb_id=tmdb_id,
        tmdb_rating=movie_data['tmdb_rating'],
        tmdb_vote_count=movie_data['tmdb_vote_count'],
        poster_url=movie_data['poster_url'],
        backdrop_url=movie_data['backdrop_url'],
        trailer_url=f"https://www.youtube.com/watch?v={videos[0]['key']}" if videos else '',
        actors=[actor['name'] for actor in credits['cast'][:10]],
        director=next((crew['name'] for crew in credits['crew'] if crew['job'] == 'Director'), ''),
        language=movie_data['language'],
        source='tmdb',
        uploaded_by=request.user
    )

    # Add genres
    for genre_id in movie_data['genre_ids']:
        try:
            genre = Genre.objects.get(tmdb_id=genre_id)
            movie.genres.add(genre)
        except Genre.DoesNotExist:
            pass

    return Response(MovieSerializer(movie).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def tmdb_discover_view(request):
    """
    Discover movies with filters from TMDb.
    GET /api/movies/tmdb/discover/?genre_ids=28,12&year=2023&min_rating=7.0&page=1
    """
    genre_ids = request.query_params.get('genre_ids', '').split(',')
    genre_ids = [int(g) for g in genre_ids if g.isdigit()]

    year = request.query_params.get('year')
    year = int(year) if year and year.isdigit() else None

    min_rating = request.query_params.get('min_rating')
    min_rating = float(min_rating) if min_rating else None

    page = int(request.query_params.get('page', 1))

    results = tmdb_service.discover_movies(genre_ids, year, min_rating, page)
    return Response(results)


# Watch history endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_watch_history_view(request):
    """
    Add movie to watch history.
    POST /api/movies/watch-history/
    Body: {"movie_id": 1}
    """
    movie_id = request.data.get('movie_id')
    if not movie_id:
        return Response({'error': 'movie_id required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        movie = Movie.objects.get(id=movie_id)
    except Movie.DoesNotExist:
        return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)

    watch_history, created = WatchHistory.objects.get_or_create(
        user=request.user,
        movie=movie
    )

    return Response({
        'message': 'Added to watch history' if created else 'Already in watch history',
        'data': WatchHistorySerializer(watch_history).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_watch_history_view(request):
    """
    Get user's watch history.
    GET /api/movies/watch-history/
    """
    history = WatchHistory.objects.filter(user=request.user)
    serializer = WatchHistorySerializer(history, many=True)
    return Response(serializer.data)

"""
API views for reviews app.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from movies.models import Movie
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateUpdateSerializer


@api_view(['GET'])
def movie_reviews_view(request, movie_id):
    """
    Get all reviews for a movie.
    GET /api/reviews/movie/{movie_id}/
    """
    reviews = Review.objects.filter(movie_id=movie_id)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review_view(request):
    """
    Create or update a review for a movie.
    POST /api/reviews/
    Body: {"movie": 1, "rating": 5, "review_text": "Great movie!"}
    """
    serializer = ReviewCreateUpdateSerializer(data=request.data)

    if serializer.is_valid():
        movie = serializer.validated_data['movie']

        # Check if user already reviewed this movie
        existing_review = Review.objects.filter(user=request.user, movie=movie).first()

        if existing_review:
            # Update existing review
            existing_review.rating = serializer.validated_data['rating']
            existing_review.review_text = serializer.validated_data.get('review_text', '')
            existing_review.save()
            return Response(
                ReviewSerializer(existing_review).data,
                status=status.HTTP_200_OK
            )
        else:
            # Create new review
            review = serializer.save(user=request.user)
            return Response(
                ReviewSerializer(review).data,
                status=status.HTTP_201_CREATED
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_review_view(request, pk):
    """
    Update a review (only by the owner).
    PUT/PATCH /api/reviews/{id}/
    """
    review = get_object_or_404(Review, pk=pk)

    # Check if user owns this review
    if review.user != request.user:
        return Response(
            {'error': 'You can only update your own reviews'},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ReviewCreateUpdateSerializer(review, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(ReviewSerializer(review).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_review_view(request, pk):
    """
    Delete a review (only by the owner).
    DELETE /api/reviews/{id}/
    """
    review = get_object_or_404(Review, pk=pk)

    # Check if user owns this review
    if review.user != request.user:
        return Response(
            {'error': 'You can only delete your own reviews'},
            status=status.HTTP_403_FORBIDDEN
        )

    review.delete()
    return Response({'message': 'Review deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews_view(request):
    """
    Get all reviews by the current user.
    GET /api/reviews/my-reviews/
    """
    reviews = Review.objects.filter(user=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def movie_average_rating_view(request, movie_id):
    """
    Get average rating for a movie.
    GET /api/reviews/movie/{movie_id}/average/
    """
    movie = get_object_or_404(Movie, pk=movie_id)
    reviews = Review.objects.filter(movie=movie)

    if reviews.exists():
        from django.db.models import Avg
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
        return Response({
            'movie_id': movie_id,
            'average_rating': round(avg_rating, 1),
            'total_reviews': reviews.count()
        })
    else:
        return Response({
            'movie_id': movie_id,
            'average_rating': movie.tmdb_rating or 0,
            'total_reviews': 0
        })

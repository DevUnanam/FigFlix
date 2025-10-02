"""
API views for recommendations app.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .recommendation_engine import RecommendationEngine


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations_view(request):
    """
    Get personalized movie recommendations for the user.
    GET /api/recommendations/
    """
    limit = int(request.query_params.get('limit', 10))

    engine = RecommendationEngine(request.user)
    recommendations = engine.get_personalized_recommendations(limit=limit)

    return Response({
        'recommendations': recommendations,
        'count': len(recommendations)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_similar_movies_view(request, movie_id):
    """
    Get movies similar to the given movie.
    GET /api/recommendations/similar/{movie_id}/
    """
    limit = int(request.query_params.get('limit', 5))

    engine = RecommendationEngine(request.user)
    similar_movies = engine.get_similar_movies(movie_id, limit=limit)

    return Response({
        'similar_movies': similar_movies,
        'count': len(similar_movies)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_with_bot_view(request):
    """
    Chat with the recommendation bot.
    POST /api/recommendations/chat/
    Body: {"message": "Recommend me some action movies"}
    """
    user_message = request.data.get('message', '')

    if not user_message:
        return Response(
            {'error': 'Message is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save user message
    user_chat = ChatMessage.objects.create(
        user=request.user,
        sender='user',
        message=user_message
    )

    # Generate bot response
    engine = RecommendationEngine(request.user)
    bot_response = engine.generate_chat_response(user_message)

    # Save bot response
    bot_chat = ChatMessage.objects.create(
        user=request.user,
        sender='bot',
        message=bot_response
    )

    return Response({
        'user_message': ChatMessageSerializer(user_chat).data,
        'bot_response': ChatMessageSerializer(bot_chat).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_history_view(request):
    """
    Get chat history for the current user.
    GET /api/recommendations/chat/history/
    """
    messages = ChatMessage.objects.filter(user=request.user)
    serializer = ChatMessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_chat_history_view(request):
    """
    Clear chat history for the current user.
    DELETE /api/recommendations/chat/history/
    """
    ChatMessage.objects.filter(user=request.user).delete()
    return Response({'message': 'Chat history cleared'}, status=status.HTTP_204_NO_CONTENT)

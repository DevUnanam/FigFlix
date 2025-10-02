"""
API views for accounts app.
"""
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer, UserPreferenceSerializer
from .models import UserPreference

User = get_user_model()


class RegisterAPIView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    POST /api/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user details.
    GET /api/user/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_preferences_view(request):
    """
    Update user preferences.
    PUT/PATCH /api/preferences/
    """
    try:
        preferences = request.user.preferences
    except UserPreference.DoesNotExist:
        preferences = UserPreference.objects.create(user=request.user)

    serializer = UserPreferenceSerializer(preferences, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_preferences_view(request):
    """
    Get user preferences.
    GET /api/preferences/
    """
    try:
        preferences = request.user.preferences
        serializer = UserPreferenceSerializer(preferences)
        return Response(serializer.data)
    except UserPreference.DoesNotExist:
        return Response({'detail': 'Preferences not found'}, status=status.HTTP_404_NOT_FOUND)

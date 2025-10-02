"""
Serializers for accounts app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserPreference

User = get_user_model()


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    class Meta:
        model = UserPreference
        fields = [
            'favorite_genres', 'favorite_actors', 'preferred_languages',
            'min_rating', 'preferred_release_year_start', 'preferred_release_year_end'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    preferences = UserPreferenceSerializer(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'role', 'preferences']
        extra_kwargs = {'role': {'default': 'user'}}

    def validate(self, data):
        """Validate passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        """Create user with hashed password and preferences"""
        validated_data.pop('password_confirm')
        preferences_data = validated_data.pop('preferences', None)

        role = validated_data.get('role', 'user')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=role
        )

        # If admin role, grant Django admin access
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()

        # Create user preferences if provided
        if preferences_data:
            UserPreference.objects.create(user=user, **preferences_data)
        else:
            UserPreference.objects.create(user=user)

        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    preferences = UserPreferenceSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'preferences', 'date_joined']
        read_only_fields = ['id', 'date_joined']

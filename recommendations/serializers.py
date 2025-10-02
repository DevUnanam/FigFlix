"""
Serializers for recommendations app.
"""
from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'created_at']
        read_only_fields = ['created_at']

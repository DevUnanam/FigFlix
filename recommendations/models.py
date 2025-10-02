"""
Models for recommendations app.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatMessage(models.Model):
    """
    Store chat messages between user and recommendation bot.
    """
    SENDER_CHOICES = (
        ('user', 'User'),
        ('bot', 'Bot'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.message[:50]}"

    class Meta:
        ordering = ['created_at']

"""
Admin configuration for recommendations app.
"""
from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Chat message admin"""
    list_display = ('user', 'sender', 'message_preview', 'created_at')
    list_filter = ('sender', 'created_at')
    search_fields = ('user__username', 'message')
    date_hierarchy = 'created_at'

    def message_preview(self, obj):
        return obj.message[:100]
    message_preview.short_description = 'Message'

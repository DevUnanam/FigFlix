"""
Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserPreference


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ('username', 'email', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    """User preferences admin"""
    list_display = ('user', 'min_rating', 'created_at', 'updated_at')
    search_fields = ('user__username',)

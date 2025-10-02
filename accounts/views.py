"""
Views for accounts app - template rendering.
"""
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_http_methods


@require_http_methods(["GET", "POST"])
def login_view(request):
    """Handle user login"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password')

    return render(request, 'accounts/login.html')


@require_http_methods(["GET"])
def register_user_view(request):
    """Handle user registration page"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    return render(request, 'accounts/register_user.html')


@require_http_methods(["GET"])
def register_admin_view(request):
    """Handle admin registration page"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    return render(request, 'accounts/register_admin.html')


@require_http_methods(["GET"])
def register_view(request):
    """Legacy registration - redirect to user registration"""
    return redirect('register_user')


def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully')
    return redirect('login')


@login_required
def dashboard_view(request):
    """User dashboard - different views for admin and regular users"""
    context = {
        'user': request.user,
        'is_admin': request.user.role == 'admin'
    }
    return render(request, 'accounts/dashboard.html', context)


@login_required
def profile_view(request):
    """User profile page"""
    return render(request, 'accounts/profile.html', {'user': request.user})

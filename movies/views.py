"""
Template views for movies app.
"""
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Movie


def movie_list_view(request):
    """
    Display list of movies.
    """
    context = {
        'title': 'Movies'
    }
    return render(request, 'movies/movie_list.html', context)


def movie_detail_view(request, pk):
    """
    Display movie details.
    """
    movie = get_object_or_404(Movie, pk=pk)
    context = {
        'movie': movie
    }
    return render(request, 'movies/movie_detail.html', context)


@login_required
def admin_upload_view(request):
    """
    Admin movie upload page.
    """
    if request.user.role != 'admin':
        return render(request, '403.html', status=403)

    return render(request, 'movies/admin_upload.html')


@login_required
def manage_movies_view(request):
    """
    Manage movies page (admin only).
    """
    if request.user.role != 'admin':
        return render(request, '403.html', status=403)

    return render(request, 'movies/manage_movies.html')

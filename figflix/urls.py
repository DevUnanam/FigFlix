"""
URL configuration for figflix project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/home/', permanent=False), name='root'),
    path('admin/', admin.site.urls),

    # App URLs
    path('', include('accounts.urls')),
    path('', include('movies.urls')),
    path('', include('reviews.urls')),
    path('', include('recommendations.urls')),

    # API URLs
    path('api/', include('accounts.api_urls')),
    path('api/movies/', include('movies.api_urls')),
    path('api/reviews/', include('reviews.api_urls')),
    path('api/recommendations/', include('recommendations.api_urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

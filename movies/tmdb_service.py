"""
TMDb API Service - handles all interactions with The Movie Database API.
"""
import requests
from django.conf import settings
from typing import Dict, List, Optional


class TMDbService:
    """
    Service class for TMDb API integration.
    """

    def __init__(self):
        self.api_key = settings.TMDB_API_KEY
        self.base_url = settings.TMDB_BASE_URL
        self.image_base_url = settings.TMDB_IMAGE_BASE_URL

    def _make_request(self, endpoint: str, params: Dict = None) -> Optional[Dict]:
        """
        Make HTTP request to TMDb API.

        Args:
            endpoint: API endpoint (e.g., '/movie/popular')
            params: Query parameters

        Returns:
            JSON response as dictionary, or None if error
        """
        if not self.api_key:
            print("Warning: TMDB_API_KEY not configured")
            return None

        url = f"{self.base_url}{endpoint}"
        default_params = {'api_key': self.api_key, 'language': 'en-US'}

        if params:
            default_params.update(params)

        try:
            response = requests.get(url, params=default_params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"TMDb API Error: {e}")
            return None

    def search_movies(self, query: str, page: int = 1) -> Dict:
        """
        Search for movies by title.

        Example: GET /search/movie?api_key=XXX&query=Inception
        """
        data = self._make_request('/search/movie', {'query': query, 'page': page})
        return self._format_movie_results(data)

    def get_popular_movies(self, page: int = 1) -> Dict:
        """
        Get popular movies.

        Example: GET /movie/popular?api_key=XXX&page=1
        """
        data = self._make_request('/movie/popular', {'page': page})
        return self._format_movie_results(data)

    def get_top_rated_movies(self, page: int = 1) -> Dict:
        """
        Get top rated movies.
        """
        data = self._make_request('/movie/top_rated', {'page': page})
        return self._format_movie_results(data)

    def get_movie_details(self, movie_id: int) -> Optional[Dict]:
        """
        Get detailed information about a movie.

        Example: GET /movie/{movie_id}?api_key=XXX
        """
        data = self._make_request(f'/movie/{movie_id}')
        if data:
            return self._format_movie_detail(data)
        return None

    def get_movie_videos(self, movie_id: int) -> List[Dict]:
        """
        Get movie trailers and videos.

        Example: GET /movie/{movie_id}/videos?api_key=XXX
        """
        data = self._make_request(f'/movie/{movie_id}/videos')
        if data and 'results' in data:
            # Filter for YouTube trailers
            trailers = [
                v for v in data['results']
                if v.get('site') == 'YouTube' and v.get('type') == 'Trailer'
            ]
            return trailers
        return []

    def get_movie_credits(self, movie_id: int) -> Dict:
        """
        Get movie cast and crew.
        """
        data = self._make_request(f'/movie/{movie_id}/credits')
        if data:
            return {
                'cast': data.get('cast', [])[:10],  # Top 10 actors
                'crew': data.get('crew', [])
            }
        return {'cast': [], 'crew': []}

    def get_genres(self) -> List[Dict]:
        """
        Get list of all movie genres.

        Example: GET /genre/movie/list?api_key=XXX
        """
        data = self._make_request('/genre/movie/list')
        if data and 'genres' in data:
            return data['genres']
        return []

    def discover_movies(self, genre_ids: List[int] = None, year: int = None,
                       min_rating: float = None, page: int = 1) -> Dict:
        """
        Discover movies with filters.

        Example: GET /discover/movie?api_key=XXX&with_genres=28,12&primary_release_year=2023
        """
        params = {'page': page, 'sort_by': 'popularity.desc'}

        if genre_ids:
            params['with_genres'] = ','.join(map(str, genre_ids))
        if year:
            params['primary_release_year'] = year
        if min_rating:
            params['vote_average.gte'] = min_rating

        data = self._make_request('/discover/movie', params)
        return self._format_movie_results(data)

    def _format_movie_results(self, data: Optional[Dict]) -> Dict:
        """
        Format movie search/list results.
        """
        if not data:
            return {'results': [], 'total_pages': 0, 'total_results': 0}

        results = []
        for movie in data.get('results', []):
            results.append({
                'tmdb_id': movie.get('id'),
                'title': movie.get('title'),
                'description': movie.get('overview'),
                'release_year': movie.get('release_date', '')[:4] if movie.get('release_date') else None,
                'poster_url': f"{self.image_base_url}{movie.get('poster_path')}" if movie.get('poster_path') else '',
                'backdrop_url': f"{self.image_base_url}{movie.get('backdrop_path')}" if movie.get('backdrop_path') else '',
                'tmdb_rating': movie.get('vote_average'),
                'tmdb_vote_count': movie.get('vote_count'),
                'genre_ids': movie.get('genre_ids', [])
            })

        return {
            'results': results,
            'total_pages': data.get('total_pages', 0),
            'total_results': data.get('total_results', 0),
            'page': data.get('page', 1)
        }

    def _format_movie_detail(self, data: Dict) -> Dict:
        """
        Format detailed movie information.
        """
        return {
            'tmdb_id': data.get('id'),
            'title': data.get('title'),
            'description': data.get('overview'),
            'release_year': data.get('release_date', '')[:4] if data.get('release_date') else None,
            'runtime': data.get('runtime'),
            'poster_url': f"{self.image_base_url}{data.get('poster_path')}" if data.get('poster_path') else '',
            'backdrop_url': f"{self.image_base_url}{data.get('backdrop_path')}" if data.get('backdrop_path') else '',
            'tmdb_rating': data.get('vote_average'),
            'tmdb_vote_count': data.get('vote_count'),
            'genres': [g['name'] for g in data.get('genres', [])],
            'genre_ids': [g['id'] for g in data.get('genres', [])],
            'language': data.get('original_language'),
            'homepage': data.get('homepage'),
        }

    def get_poster_url(self, poster_path: str) -> str:
        """Get full poster URL from path"""
        if poster_path:
            return f"{self.image_base_url}{poster_path}"
        return ''


# Singleton instance
tmdb_service = TMDbService()

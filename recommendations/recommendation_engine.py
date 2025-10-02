"""
AI-powered movie recommendation engine.
"""
from typing import List, Dict
from movies.tmdb_service import tmdb_service
from movies.models import Movie, WatchHistory, Genre
from reviews.models import Review
from accounts.models import UserPreference
from django.db.models import Avg


class RecommendationEngine:
    """
    AI recommendation engine that suggests movies based on:
    - User preferences (genres, actors, languages)
    - Watch history
    - Ratings
    """

    def __init__(self, user):
        self.user = user

    def get_personalized_recommendations(self, limit: int = 10) -> List[Dict]:
        """
        Get personalized movie recommendations for the user.
        Combines user preferences, watch history, and ratings.
        """
        recommendations = []

        # Get user preferences
        try:
            prefs = self.user.preferences
        except UserPreference.DoesNotExist:
            # No preferences, return popular movies
            return self._get_popular_movies(limit)

        # Get genre IDs from favorite genres
        genre_ids = []
        if prefs.favorite_genres:
            genres = Genre.objects.filter(name__in=prefs.favorite_genres)
            genre_ids = [g.tmdb_id for g in genres if g.tmdb_id]

        # Get movies user has already watched
        watched_movie_ids = WatchHistory.objects.filter(
            user=self.user
        ).values_list('movie__tmdb_id', flat=True)

        # Get highly rated genres from user's reviews
        user_reviews = Review.objects.filter(user=self.user, rating__gte=4)
        highly_rated_genres = []
        for review in user_reviews:
            movie_genres = review.movie.genres.all()
            highly_rated_genres.extend([g.tmdb_id for g in movie_genres if g.tmdb_id])

        # Combine preferred and highly rated genres
        all_genre_ids = list(set(genre_ids + highly_rated_genres))

        # Discover movies from TMDb
        if all_genre_ids:
            tmdb_results = tmdb_service.discover_movies(
                genre_ids=all_genre_ids,
                min_rating=prefs.min_rating if prefs.min_rating > 0 else None,
                page=1
            )

            # Filter out already watched movies
            for movie in tmdb_results.get('results', []):
                if movie['tmdb_id'] not in watched_movie_ids:
                    recommendations.append(movie)
                    if len(recommendations) >= limit:
                        break

        # If not enough recommendations, add popular movies
        if len(recommendations) < limit:
            popular = self._get_popular_movies(limit - len(recommendations))
            recommendations.extend(popular)

        return recommendations[:limit]

    def get_similar_movies(self, movie_id: int, limit: int = 5) -> List[Dict]:
        """
        Get movies similar to the given movie based on genres.
        """
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return []

        # Get genre IDs
        genre_ids = [g.tmdb_id for g in movie.genres.all() if g.tmdb_id]

        if not genre_ids:
            return []

        # Discover similar movies
        tmdb_results = tmdb_service.discover_movies(genre_ids=genre_ids, page=1)

        similar = []
        for tmdb_movie in tmdb_results.get('results', []):
            # Exclude the same movie
            if tmdb_movie['tmdb_id'] != movie.tmdb_id:
                similar.append(tmdb_movie)
                if len(similar) >= limit:
                    break

        return similar

    def _get_popular_movies(self, limit: int) -> List[Dict]:
        """
        Fallback: get popular movies from TMDb.
        """
        tmdb_results = tmdb_service.get_popular_movies(page=1)
        return tmdb_results.get('results', [])[:limit]

    def generate_chat_response(self, user_message: str) -> str:
        """
        Generate a chat response based on user message.
        This is a simple rule-based chatbot. For production, integrate with OpenAI/Anthropic API.
        """
        user_message_lower = user_message.lower()

        # Check for greeting
        if any(word in user_message_lower for word in ['hello', 'hi', 'hey']):
            return f"Hello {self.user.username}! I'm your movie recommendation assistant. I can help you discover great movies based on your preferences. What kind of movies are you in the mood for?"

        # Check for genre request
        genres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'romance', 'sci-fi', 'fantasy', 'animation']
        for genre in genres:
            if genre in user_message_lower:
                return self._recommend_by_genre(genre.capitalize())

        # Check for mood-based requests
        if 'happy' in user_message_lower or 'feel good' in user_message_lower:
            return self._recommend_by_genre('Comedy')
        elif 'scary' in user_message_lower or 'frightening' in user_message_lower:
            return self._recommend_by_genre('Horror')
        elif 'exciting' in user_message_lower or 'thrilling' in user_message_lower:
            return self._recommend_by_genre('Action')

        # Check for recommendation request
        if any(word in user_message_lower for word in ['recommend', 'suggest', 'movie', 'watch']):
            recommendations = self.get_personalized_recommendations(limit=3)
            if recommendations:
                movie_list = '\n'.join([f"- {m['title']} ({m['release_year']}) - Rating: {m['tmdb_rating']}/10" for m in recommendations])
                return f"Based on your preferences, I recommend:\n\n{movie_list}\n\nWould you like more suggestions?"
            else:
                return "I'm still learning your preferences. Try rating some movies to get better recommendations!"

        # Default response
        return "I can help you find great movies! Try asking me for recommendations, or tell me what genre you're interested in (action, comedy, drama, etc.)."

    def _recommend_by_genre(self, genre_name: str) -> str:
        """
        Get recommendations for a specific genre.
        """
        try:
            genre = Genre.objects.get(name__iexact=genre_name)
            if genre.tmdb_id:
                tmdb_results = tmdb_service.discover_movies(genre_ids=[genre.tmdb_id], page=1)
                movies = tmdb_results.get('results', [])[:3]

                if movies:
                    movie_list = '\n'.join([f"- {m['title']} ({m['release_year']}) - Rating: {m['tmdb_rating']}/10" for m in movies])
                    return f"Here are some great {genre_name} movies:\n\n{movie_list}\n\nWould you like more suggestions?"
        except Genre.DoesNotExist:
            pass

        return f"I don't have enough {genre_name} movies yet, but I'm working on it! Try asking for other genres."


# Example enhanced version with AI (commented out - requires API key)
"""
import openai  # or anthropic

class AIRecommendationEngine(RecommendationEngine):
    def generate_chat_response(self, user_message: str) -> str:
        # Get context about user
        context = self._build_user_context()

        # Call OpenAI/Anthropic API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are a movie recommendation assistant. User context: {context}"},
                {"role": "user", "content": user_message}
            ]
        )

        return response.choices[0].message.content

    def _build_user_context(self) -> str:
        # Build context with user preferences, watch history, ratings
        try:
            prefs = self.user.preferences
            context = f"Favorite genres: {', '.join(prefs.favorite_genres)}"
            return context
        except:
            return "New user with no preferences yet"
"""

/**
 * Movie detail page JavaScript
 */

let currentRating = 0;

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadReviews();
    await loadSimilarMovies();
});

/**
 * Set rating (star selection)
 */
function setRating(rating) {
    currentRating = rating;
    document.getElementById('ratingInput').value = rating;

    // Update star display
    document.querySelectorAll('.star-btn').forEach((btn, index) => {
        if (index < rating) {
            btn.textContent = '★';
            btn.classList.add('star-rating');
        } else {
            btn.textContent = '☆';
            btn.classList.remove('star-rating');
        }
    });
}

/**
 * Load reviews for the movie
 */
async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');

    try {
        const response = await API.reviews.getByMovie(movieId);
        const reviews = response.data;

        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-gray-400 text-center py-4">No reviews yet. Be the first to review!</p>';
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="font-bold">${review.user_username}</span>
                        <span class="ml-2 star-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <span class="text-xs text-gray-400">${new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                ${review.review_text ? `<p class="text-gray-300 text-sm">${review.review_text}</p>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load reviews:', error);
        reviewsList.innerHTML = '<p class="text-gray-400 text-center py-4">Failed to load reviews</p>';
    }
}

/**
 * Handle review form submission
 */
document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }

    const reviewText = document.getElementById('reviewText').value.trim();

    try {
        await API.reviews.create({
            movie: movieId,
            rating: currentRating,
            review_text: reviewText
        });

        // Reset form
        document.getElementById('reviewForm').reset();
        setRating(0);

        // Reload reviews
        await loadReviews();

        alert('Review submitted successfully!');
    } catch (error) {
        const errorMsg = handleAPIError(error);
        alert(`Failed to submit review: ${errorMsg}`);
    }
});

/**
 * Load similar movies
 */
async function loadSimilarMovies() {
    const container = document.getElementById('similarMovies');

    try {
        const response = await API.recommendations.getSimilar(movieId, 5);
        const movies = response.data.similar_movies;

        if (movies.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm">No similar movies found</p>';
            return;
        }

        container.innerHTML = movies.map(movie => `
            <div class="flex space-x-3">
                <img
                    src="${movie.poster_url || 'https://via.placeholder.com/80x120?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-16 h-24 object-cover rounded"
                    onerror="this.src='https://via.placeholder.com/80x120?text=No+Poster'"
                >
                <div class="flex-1">
                    <h4 class="font-semibold text-sm truncate">${movie.title}</h4>
                    <p class="text-xs text-gray-400">${movie.release_year || 'N/A'}</p>
                    <p class="text-xs star-rating">⭐ ${movie.tmdb_rating?.toFixed(1) || 'N/A'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load similar movies:', error);
        container.innerHTML = '<p class="text-gray-400 text-sm">Failed to load similar movies</p>';
    }
}

/**
 * Add movie to watch history
 */
async function addToWatchHistory() {
    try {
        await API.movies.watchHistory.add(movieId);
        alert('Added to watch history!');
    } catch (error) {
        const errorMsg = handleAPIError(error);
        alert(`Failed to add to watch history: ${errorMsg}`);
    }
}

// Make functions global
window.setRating = setRating;
window.addToWatchHistory = addToWatchHistory;

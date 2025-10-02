/**
 * Profile page JavaScript
 */

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    await loadPreferences();
    await loadMyReviews();
});

/**
 * Load genres for selection
 */
async function loadGenres() {
    try {
        const response = await API.movies.getGenres();
        const genres = response.data;

        const genreContainer = document.getElementById('genreSelection');
        genreContainer.innerHTML = '';

        genres.forEach(genre => {
            const checkbox = document.createElement('div');
            checkbox.className = 'flex items-center';
            checkbox.innerHTML = `
                <input
                    type="checkbox"
                    id="genre-${genre.id}"
                    value="${genre.name}"
                    class="mr-2 w-4 h-4"
                >
                <label for="genre-${genre.id}" class="text-sm cursor-pointer">${genre.name}</label>
            `;
            genreContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Failed to load genres:', error);
    }
}

/**
 * Load user preferences
 */
async function loadPreferences() {
    try {
        const response = await API.auth.getPreferences();
        const prefs = response.data;

        // Set selected genres
        if (prefs.favorite_genres && prefs.favorite_genres.length > 0) {
            prefs.favorite_genres.forEach(genreName => {
                const checkbox = document.querySelector(`#genreSelection input[value="${genreName}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }

        // Set actors
        if (prefs.favorite_actors && prefs.favorite_actors.length > 0) {
            document.getElementById('actors').value = prefs.favorite_actors.join(', ');
        }

        // Set languages
        if (prefs.preferred_languages && prefs.preferred_languages.length > 0) {
            document.getElementById('languages').value = prefs.preferred_languages.join(', ');
        }

        // Set minimum rating
        if (prefs.min_rating) {
            document.getElementById('minRating').value = prefs.min_rating;
        }
    } catch (error) {
        console.error('Failed to load preferences:', error);
    }
}

/**
 * Handle preferences form submission
 */
document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get selected genres
    const selectedGenres = [];
    document.querySelectorAll('#genreSelection input[type="checkbox"]:checked').forEach(cb => {
        selectedGenres.push(cb.value);
    });

    // Get actors and languages
    const actors = document.getElementById('actors').value
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

    const languages = document.getElementById('languages').value
        .split(',')
        .map(l => l.trim())
        .filter(l => l);

    const minRating = parseFloat(document.getElementById('minRating').value) || 0;

    const preferencesData = {
        favorite_genres: selectedGenres,
        favorite_actors: actors,
        preferred_languages: languages,
        min_rating: minRating
    };

    try {
        await API.auth.updatePreferences(preferencesData);
        showMessage('message', 'Preferences updated successfully!', 'success');
    } catch (error) {
        const errorMsg = handleAPIError(error);
        showMessage('message', `Failed to update preferences: ${errorMsg}`, 'error');
    }
});

/**
 * Load user's reviews
 */
async function loadMyReviews() {
    const container = document.getElementById('myReviews');

    try {
        const response = await API.reviews.getMyReviews();
        const reviews = response.data;

        if (reviews.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-8">You haven\'t reviewed any movies yet</p>';
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div class="bg-gray-700 rounded-lg p-4 flex justify-between items-start">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h4 class="font-bold">${review.movie_title}</h4>
                        <span class="star-rating text-sm">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    ${review.review_text ? `<p class="text-sm text-gray-300">${review.review_text}</p>` : ''}
                    <p class="text-xs text-gray-400 mt-2">${new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                <button
                    onclick="deleteReview(${review.id})"
                    class="text-red-500 hover:text-red-400 ml-4"
                    title="Delete review"
                >
                    🗑️
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load reviews:', error);
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Failed to load reviews</p>';
    }
}

/**
 * Delete a review
 */
async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }

    try {
        await API.reviews.delete(reviewId);
        await loadMyReviews();
        alert('Review deleted successfully');
    } catch (error) {
        const errorMsg = handleAPIError(error);
        alert(`Failed to delete review: ${errorMsg}`);
    }
}

// Make functions global
window.deleteReview = deleteReview;

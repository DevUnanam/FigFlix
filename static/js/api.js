/**
 * API utility module for making requests to the backend.
 * Uses axios for HTTP requests with CSRF token handling.
 */

// Get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Configure axios defaults
axios.defaults.headers.common['X-CSRFToken'] = csrftoken;

// API base URLs
const API_BASE = '/api';

/**
 * API client for making requests
 */
const API = {
    // Authentication
    auth: {
        register: (data) => axios.post(`${API_BASE}/register/`, data),
        login: (data) => axios.post(`${API_BASE}/login/`, data),
        getCurrentUser: () => axios.get(`${API_BASE}/user/`),
        getPreferences: () => axios.get(`${API_BASE}/preferences/`),
        updatePreferences: (data) => axios.put(`${API_BASE}/preferences/update/`, data),
    },

    // Movies
    movies: {
        list: (params) => axios.get(`${API_BASE}/movies/`, { params }),
        get: (id) => axios.get(`${API_BASE}/movies/${id}/`),
        create: (data) => axios.post(`${API_BASE}/movies/create/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        getGenres: () => axios.get(`${API_BASE}/movies/genres/`),
        syncGenres: () => axios.post(`${API_BASE}/movies/genres/sync/`),

        // TMDb integration
        tmdb: {
            search: (query, page = 1) => axios.get(`${API_BASE}/movies/tmdb/search/`, {
                params: { q: query, page }
            }),
            popular: (page = 1) => axios.get(`${API_BASE}/movies/tmdb/popular/`, {
                params: { page }
            }),
            topRated: (page = 1) => axios.get(`${API_BASE}/movies/tmdb/top-rated/`, {
                params: { page }
            }),
            discover: (params) => axios.get(`${API_BASE}/movies/tmdb/discover/`, { params }),
            getDetails: (tmdbId) => axios.get(`${API_BASE}/movies/tmdb/${tmdbId}/`),
            import: (tmdbId) => axios.post(`${API_BASE}/movies/tmdb/${tmdbId}/import/`),
        },

        // Watch history
        watchHistory: {
            list: () => axios.get(`${API_BASE}/movies/watch-history/`),
            add: (movieId) => axios.post(`${API_BASE}/movies/watch-history/add/`, { movie_id: movieId }),
        }
    },

    // Reviews
    reviews: {
        create: (data) => axios.post(`${API_BASE}/reviews/`, data),
        update: (id, data) => axios.put(`${API_BASE}/reviews/${id}/`, data),
        delete: (id) => axios.delete(`${API_BASE}/reviews/${id}/delete/`),
        getByMovie: (movieId) => axios.get(`${API_BASE}/reviews/movie/${movieId}/`),
        getMyReviews: () => axios.get(`${API_BASE}/reviews/my-reviews/`),
        getMovieAverage: (movieId) => axios.get(`${API_BASE}/reviews/movie/${movieId}/average/`),
    },

    // Recommendations
    recommendations: {
        get: (limit = 10) => axios.get(`${API_BASE}/recommendations/`, { params: { limit } }),
        getSimilar: (movieId, limit = 5) => axios.get(`${API_BASE}/recommendations/similar/${movieId}/`, {
            params: { limit }
        }),
        chat: (message) => axios.post(`${API_BASE}/recommendations/chat/`, { message }),
        getChatHistory: () => axios.get(`${API_BASE}/recommendations/chat/history/`),
        clearChatHistory: () => axios.delete(`${API_BASE}/recommendations/chat/history/`),
    }
};

// Export for use in other scripts
window.API = API;

/**
 * Utility function to handle API errors
 */
function handleAPIError(error) {
    console.error('API Error:', error);

    if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
            return 'Please log in to continue';
        } else if (status === 403) {
            return 'You do not have permission to perform this action';
        } else if (status === 404) {
            return 'Resource not found';
        } else if (data && data.error) {
            return data.error;
        } else if (data && typeof data === 'object') {
            // Handle validation errors
            const errors = Object.values(data).flat();
            return errors.join(', ');
        }
    } else if (error.request) {
        // Request made but no response
        return 'Network error. Please check your connection';
    }

    return 'An unexpected error occurred';
}

window.handleAPIError = handleAPIError;

/**
 * Show success message
 */
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = `p-4 rounded-lg ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`;
    element.classList.remove('hidden');

    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

window.showMessage = showMessage;

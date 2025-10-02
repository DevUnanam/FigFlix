/**
 * Manage Movies page JavaScript
 */

let allMovies = [];
let filteredMovies = [];

// Load movies on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMovies();

    // Set up event listeners
    document.getElementById('searchInput').addEventListener('input', filterMovies);
    document.getElementById('sourceFilter').addEventListener('change', filterMovies);
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
});

/**
 * Load all movies
 */
async function loadMovies() {
    showLoading(true);

    try {
        const response = await API.movies.list();
        allMovies = response.data;
        filteredMovies = [...allMovies];
        displayMovies();
    } catch (error) {
        console.error('Failed to load movies:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

/**
 * Display movies in table
 */
function displayMovies() {
    const tbody = document.getElementById('moviesTableBody');

    if (filteredMovies.length === 0) {
        showNoResults();
        tbody.innerHTML = '';
        return;
    }

    hideNoResults();

    tbody.innerHTML = filteredMovies.map(movie => `
        <tr class="border-t border-gray-700 hover:bg-gray-800">
            <td class="px-6 py-4">
                <img
                    src="${movie.poster_image_url || 'https://via.placeholder.com/50x75?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-12 h-18 object-cover rounded"
                    onerror="this.src='https://via.placeholder.com/50x75?text=No+Poster'"
                >
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold">${movie.title}</div>
                <div class="text-xs text-gray-400 truncate max-w-xs">${movie.description || 'No description'}</div>
            </td>
            <td class="px-6 py-4 text-gray-300">${movie.release_year || 'N/A'}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs ${movie.source === 'admin' ? 'bg-blue-600' : 'bg-purple-600'}">
                    ${movie.source === 'admin' ? 'Admin' : 'TMDb'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="star-rating">⭐ ${movie.average_rating?.toFixed(1) || '0.0'}</span>
            </td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button
                        onclick="viewMovie(${movie.id})"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
                        title="View"
                    >
                        👁️
                    </button>
                    <button
                        onclick="editMovie(${movie.id})"
                        class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onclick="deleteMovie(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter movies based on search and source
 */
function filterMovies() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sourceFilter = document.getElementById('sourceFilter').value;

    filteredMovies = allMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesSource = !sourceFilter || movie.source === sourceFilter;
        return matchesSearch && matchesSource;
    });

    displayMovies();
}

/**
 * View movie details
 */
function viewMovie(movieId) {
    window.location.href = `/movies/${movieId}/`;
}

/**
 * Edit movie
 */
async function editMovie(movieId) {
    try {
        const response = await API.movies.get(movieId);
        const movie = response.data;

        // Populate form
        document.getElementById('editMovieId').value = movie.id;
        document.getElementById('editTitle').value = movie.title;
        document.getElementById('editDescription').value = movie.description || '';
        document.getElementById('editYear').value = movie.release_year || '';
        document.getElementById('editRuntime').value = movie.runtime || '';
        document.getElementById('editTrailerUrl').value = movie.trailer_url || '';
        document.getElementById('editDirector').value = movie.director || '';

        // Show modal
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load movie:', error);
        alert('Failed to load movie details');
    }
}

/**
 * Handle edit form submission
 */
async function handleEditSubmit(e) {
    e.preventDefault();

    const movieId = document.getElementById('editMovieId').value;
    const messageEl = document.getElementById('editMessage');

    const data = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        release_year: document.getElementById('editYear').value || null,
        runtime: document.getElementById('editRuntime').value || null,
        trailer_url: document.getElementById('editTrailerUrl').value || '',
        director: document.getElementById('editDirector').value || '',
    };

    try {
        await API.movies.update(movieId, data);

        messageEl.textContent = 'Movie updated successfully!';
        messageEl.className = 'p-4 rounded-lg bg-green-600 text-white';
        messageEl.classList.remove('hidden');

        setTimeout(() => {
            closeEditModal();
            loadMovies();
        }, 1500);
    } catch (error) {
        console.error('Failed to update movie:', error);
        const errorMsg = handleAPIError(error);
        messageEl.textContent = `Failed to update: ${errorMsg}`;
        messageEl.className = 'p-4 rounded-lg bg-red-600 text-white';
        messageEl.classList.remove('hidden');
    }
}

/**
 * Delete movie
 */
async function deleteMovie(movieId, movieTitle) {
    if (!confirm(`Are you sure you want to delete "${movieTitle}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await API.movies.delete(movieId);
        alert('Movie deleted successfully');
        await loadMovies();
    } catch (error) {
        console.error('Failed to delete movie:', error);
        const errorMsg = handleAPIError(error);
        alert(`Failed to delete movie: ${errorMsg}`);
    }
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    document.getElementById('editForm').reset();
    document.getElementById('editMessage').classList.add('hidden');
}

/**
 * Show/hide loading
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show no results
 */
function showNoResults() {
    document.getElementById('noResults').classList.remove('hidden');
}

/**
 * Hide no results
 */
function hideNoResults() {
    document.getElementById('noResults').classList.add('hidden');
}

// Make functions global
window.viewMovie = viewMovie;
window.editMovie = editMovie;
window.deleteMovie = deleteMovie;
window.closeEditModal = closeEditModal;

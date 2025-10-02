/**
 * Admin upload page JavaScript
 */

let currentTab = 'manual';

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenresForUpload();
});

/**
 * Switch between manual and TMDb import tabs
 */
function switchTab(tab) {
    currentTab = tab;

    const manualForm = document.getElementById('manualForm');
    const tmdbForm = document.getElementById('tmdbForm');
    const tabManual = document.getElementById('tabManual');
    const tabTmdb = document.getElementById('tabTmdb');

    if (tab === 'manual') {
        manualForm.classList.remove('hidden');
        tmdbForm.classList.add('hidden');
        tabManual.className = 'px-6 py-3 bg-primary rounded-lg font-bold';
        tabTmdb.className = 'px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold';
    } else {
        manualForm.classList.add('hidden');
        tmdbForm.classList.remove('hidden');
        tabManual.className = 'px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold';
        tabTmdb.className = 'px-6 py-3 bg-primary rounded-lg font-bold';
    }
}

/**
 * Load genres for genre selection
 */
async function loadGenresForUpload() {
    try {
        const response = await API.movies.getGenres();
        const genres = response.data;

        const genreContainer = document.getElementById('genreCheckboxes');
        genreContainer.innerHTML = '';

        genres.forEach(genre => {
            const checkbox = document.createElement('div');
            checkbox.className = 'flex items-center';
            checkbox.innerHTML = `
                <input
                    type="checkbox"
                    id="upload-genre-${genre.id}"
                    value="${genre.id}"
                    class="mr-2 w-4 h-4"
                >
                <label for="upload-genre-${genre.id}" class="text-sm cursor-pointer">${genre.name}</label>
            `;
            genreContainer.appendChild(checkbox);
        });
    } catch (error) {
        console.error('Failed to load genres:', error);
    }
}

/**
 * Handle manual upload form submission
 */
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Get form values
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);

    const releaseYear = document.getElementById('release_year').value;
    if (releaseYear) formData.append('release_year', releaseYear);

    const runtime = document.getElementById('runtime').value;
    if (runtime) formData.append('runtime', runtime);

    const poster = document.getElementById('poster').files[0];
    if (poster) formData.append('poster', poster);

    const trailerUrl = document.getElementById('trailer_url').value;
    if (trailerUrl) formData.append('trailer_url', trailerUrl);

    const director = document.getElementById('director').value;
    if (director) formData.append('director', director);

    const language = document.getElementById('language').value;
    if (language) formData.append('language', language);

    // Get selected genres
    const genreIds = [];
    document.querySelectorAll('#genreCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        genreIds.push(parseInt(cb.value));
    });
    if (genreIds.length > 0) {
        formData.append('genre_ids', JSON.stringify(genreIds));
    }

    // Get actors
    const actorsInput = document.getElementById('actors').value;
    if (actorsInput) {
        const actors = actorsInput.split(',').map(a => a.trim()).filter(a => a);
        formData.append('actors', JSON.stringify(actors));
    }

    try {
        await API.movies.create(formData);
        showMessage('message', 'Movie uploaded successfully!', 'success');

        // Reset form
        document.getElementById('uploadForm').reset();
        document.querySelectorAll('#genreCheckboxes input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Redirect to movies list after 2 seconds
        setTimeout(() => {
            window.location.href = '/movies/';
        }, 2000);

    } catch (error) {
        const errorMsg = handleAPIError(error);
        showMessage('message', `Failed to upload movie: ${errorMsg}`, 'error');
    }
});

/**
 * Search TMDb for movies
 */
async function searchTMDb() {
    const query = document.getElementById('tmdbSearch').value.trim();

    if (!query) {
        alert('Please enter a movie title');
        return;
    }

    const resultsContainer = document.getElementById('tmdbResults');
    resultsContainer.innerHTML = '<p class="text-center text-gray-400">Searching...</p>';

    try {
        const response = await API.movies.tmdb.search(query);
        const movies = response.data.results;

        if (movies.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center text-gray-400">No movies found</p>';
            return;
        }

        resultsContainer.innerHTML = movies.map(movie => `
            <div class="bg-gray-700 rounded-lg p-4 flex space-x-4">
                <img
                    src="${movie.poster_url || 'https://via.placeholder.com/100x150?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-24 h-36 object-cover rounded"
                    onerror="this.src='https://via.placeholder.com/100x150?text=No+Poster'"
                >
                <div class="flex-1">
                    <h3 class="font-bold text-lg">${movie.title}</h3>
                    <p class="text-sm text-gray-400 mb-2">${movie.release_year || 'N/A'} • ⭐ ${movie.tmdb_rating?.toFixed(1) || 'N/A'}/10</p>
                    <p class="text-sm text-gray-300 line-clamp-3">${movie.description || 'No description available'}</p>
                    <button
                        onclick="importFromTMDb(${movie.tmdb_id})"
                        class="mt-3 bg-primary hover:bg-red-700 px-4 py-2 rounded transition"
                    >
                        Import to Collection
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to search TMDb:', error);
        resultsContainer.innerHTML = '<p class="text-center text-red-500">Failed to search. Please try again.</p>';
    }
}

/**
 * Import movie from TMDb
 */
async function importFromTMDb(tmdbId) {
    if (!confirm('Are you sure you want to import this movie?')) {
        return;
    }

    try {
        await API.movies.tmdb.import(tmdbId);
        alert('Movie imported successfully!');

        // Clear search results
        document.getElementById('tmdbSearch').value = '';
        document.getElementById('tmdbResults').innerHTML = '';

        // Redirect to movies list
        setTimeout(() => {
            window.location.href = '/movies/';
        }, 1000);

    } catch (error) {
        const errorMsg = handleAPIError(error);
        alert(`Failed to import movie: ${errorMsg}`);
    }
}

// Make functions global
window.switchTab = switchTab;
window.searchTMDb = searchTMDb;
window.importFromTMDb = importFromTMDb;

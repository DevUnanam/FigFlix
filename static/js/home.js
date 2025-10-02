/**
 * Home page JavaScript - displays both local and TMDb movies with search
 */

let currentPage = 1;
let currentSource = 'all'; // 'all', 'local', or 'tmdb'
let currentSearchQuery = '';

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadMovies();

    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

/**
 * Perform search
 */
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    currentSearchQuery = query;
    currentPage = 1;
    loadMovies();
}

/**
 * Set source filter
 */
function setSource(source) {
    currentSource = source;
    currentPage = 1;

    // Update button styles
    const btnAll = document.getElementById('btnAll');
    const btnLocal = document.getElementById('btnLocal');
    const btnTmdb = document.getElementById('btnTmdb');

    btnAll.className = 'px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-semibold';
    btnLocal.className = 'px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-semibold';
    btnTmdb.className = 'px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition font-semibold';

    if (source === 'all') {
        btnAll.className = 'px-8 py-3 bg-primary rounded-lg transition font-semibold';
    } else if (source === 'local') {
        btnLocal.className = 'px-8 py-3 bg-primary rounded-lg transition font-semibold';
    } else if (source === 'tmdb') {
        btnTmdb.className = 'px-8 py-3 bg-primary rounded-lg transition font-semibold';
    }

    loadMovies();
}

/**
 * Load movies based on source and search query
 */
async function loadMovies() {
    showLoading(true);
    hideNoResults();

    try {
        if (currentSearchQuery) {
            // Search mode
            await loadSearchResults();
        } else if (currentSource === 'all') {
            // Show both local and TMDb movies
            await loadAllMovies();
        } else if (currentSource === 'local') {
            // Show only local movies
            await loadLocalMovies();
        } else if (currentSource === 'tmdb') {
            // Show only TMDb movies
            await loadTMDbMovies();
        }
    } catch (error) {
        console.error('Failed to load movies:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

/**
 * Load search results
 */
async function loadSearchResults() {
    const grid = document.getElementById('movieGrid');
    let allMovies = [];

    if (currentSource === 'all' || currentSource === 'local') {
        // Search local movies
        const localResponse = await API.movies.list({ search: currentSearchQuery, page: currentPage });
        const localMovies = localResponse.data.map(m => ({ ...m, source: 'local' }));
        allMovies = allMovies.concat(localMovies);
    }

    if (currentSource === 'all' || currentSource === 'tmdb') {
        // Search TMDb
        const tmdbResponse = await API.movies.tmdb.search(currentSearchQuery, currentPage);
        const tmdbMovies = tmdbResponse.data.results.map(m => ({ ...m, source: 'tmdb' }));
        allMovies = allMovies.concat(tmdbMovies);
    }

    if (allMovies.length === 0) {
        showNoResults();
        return;
    }

    displayMovies(allMovies);
    displayPagination(currentPage, 1); // Simple pagination for search
}

/**
 * Load all movies (both local and TMDb)
 */
async function loadAllMovies() {
    let allMovies = [];

    // Load local movies
    const localResponse = await API.movies.list({ page: currentPage });
    const localMovies = localResponse.data.map(m => ({ ...m, source: 'local' }));
    allMovies = allMovies.concat(localMovies);

    // Load TMDb popular movies
    const tmdbResponse = await API.movies.tmdb.popular(currentPage);
    const tmdbMovies = tmdbResponse.data.results.map(m => ({ ...m, source: 'tmdb' }));
    allMovies = allMovies.concat(tmdbMovies);

    displayMovies(allMovies);
    displayPagination(currentPage, tmdbResponse.data.total_pages);
}

/**
 * Load only local movies
 */
async function loadLocalMovies() {
    const response = await API.movies.list({ page: currentPage });
    const movies = response.data.map(m => ({ ...m, source: 'local' }));

    if (movies.length === 0) {
        showNoResults();
        return;
    }

    displayMovies(movies);
    displayPagination(currentPage, 1);
}

/**
 * Load only TMDb movies
 */
async function loadTMDbMovies() {
    const response = await API.movies.tmdb.popular(currentPage);
    const movies = response.data.results.map(m => ({ ...m, source: 'tmdb' }));

    if (movies.length === 0) {
        showNoResults();
        return;
    }

    displayMovies(movies);
    displayPagination(currentPage, response.data.total_pages);
}

/**
 * Display movies in grid
 */
function displayMovies(movies) {
    const grid = document.getElementById('movieGrid');

    grid.innerHTML = movies.map(movie => {
        const isLocal = movie.source === 'local';
        const rating = movie.average_rating != null ? movie.average_rating.toFixed(1) :
                      movie.tmdb_rating != null ? movie.tmdb_rating.toFixed(1) : 'N/A';
        const posterUrl = movie.poster_image_url || movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
        const movieUrl = isLocal ? `/movies/${movie.id}/` : '#';
        const badge = isLocal ? '<span class="bg-green-600 text-xs px-2 py-1 rounded">Our Collection</span>' :
                                '<span class="bg-blue-600 text-xs px-2 py-1 rounded">TMDb</span>';

        return `
        <div class="movie-card">
            <div class="relative">
                <img
                    src="${posterUrl}"
                    alt="${movie.title}"
                    class="w-full h-auto rounded-lg shadow-lg"
                    onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                >
                <div class="absolute top-2 left-2">
                    ${badge}
                </div>
                <div class="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                    <span class="text-xs">⭐ ${rating}</span>
                </div>
            </div>
            <div class="mt-2">
                <h3 class="font-semibold text-sm truncate" title="${movie.title}">${movie.title}</h3>
                <p class="text-xs text-gray-400">${movie.release_year || 'N/A'}</p>
                ${isLocal ? `
                    <a href="${movieUrl}" class="mt-2 block w-full bg-primary hover:bg-red-700 text-center text-xs py-2 rounded transition">
                        View Details
                    </a>
                ` : `
                    <button
                        onclick="viewTMDbMovie(${movie.tmdb_id})"
                        class="mt-2 w-full bg-primary hover:bg-red-700 text-xs py-2 rounded transition"
                    >
                        View Details
                    </button>
                `}
            </div>
        </div>
        `;
    }).join('');
}

/**
 * Display pagination controls
 */
function displayPagination(current, totalPages) {
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const maxPages = Math.min(totalPages, 10);
    let html = '';

    // Previous button
    if (current > 1) {
        html += `<button onclick="goToPage(${current - 1})" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">← Previous</button>`;
    }

    // Page info
    html += `<span class="px-4 py-2">Page ${current} of ${totalPages}</span>`;

    // Next button
    if (current < totalPages) {
        html += `<button onclick="goToPage(${current + 1})" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">Next →</button>`;
    }

    pagination.innerHTML = html;
}

/**
 * Go to specific page
 */
function goToPage(page) {
    currentPage = page;
    loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * View TMDb movie details
 */
async function viewTMDbMovie(tmdbId) {
    try {
        const response = await API.movies.tmdb.getDetails(tmdbId);
        const movie = response.data;

        const details = `
Title: ${movie.title}
Year: ${movie.release_year}
Rating: ${movie.tmdb_rating}/10
Description: ${movie.description}
        `;

        if (confirm(`${details}\n\nWould you like to import this movie to our collection?`)) {
            await importTMDbMovie(tmdbId);
        }
    } catch (error) {
        console.error('Failed to load movie details:', error);
        alert('Failed to load movie details');
    }
}

/**
 * Import TMDb movie to local database
 */
async function importTMDbMovie(tmdbId) {
    try {
        await API.movies.tmdb.import(tmdbId);
        alert('Movie imported successfully!');
        // Reload to show the imported movie
        if (currentSource === 'local' || currentSource === 'all') {
            loadMovies();
        }
    } catch (error) {
        const errorMsg = handleAPIError(error);
        alert(`Failed to import movie: ${errorMsg}`);
    }
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('movieGrid');

    if (show) {
        loading.classList.remove('hidden');
        grid.innerHTML = '';
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show no results message
 */
function showNoResults() {
    document.getElementById('noResults').classList.remove('hidden');
    document.getElementById('movieGrid').innerHTML = '';
}

/**
 * Hide no results message
 */
function hideNoResults() {
    document.getElementById('noResults').classList.add('hidden');
}

// Make functions global
window.setSource = setSource;
window.goToPage = goToPage;
window.viewTMDbMovie = viewTMDbMovie;
window.performSearch = performSearch;

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
        // CRITICAL: Determine if movie is from our local database or from TMDb
        // Local movies have: source='admin' OR source='local', AND have a database id field
        // TMDb movies have: tmdb_id field and source='tmdb'
        const hasLocalId = movie.id && movie.id < 10000;
        const hasTmdbId = movie.tmdb_id && movie.tmdb_id > 0;
        const isLocal = (movie.source === 'local' || movie.source === 'admin') && hasLocalId;

        // For debugging - remove this after confirming it works
        if (movie.title && (movie.title.includes('test') || Math.random() < 0.1)) {
            console.log('Movie Debug:', {
                title: movie.title,
                id: movie.id,
                tmdb_id: movie.tmdb_id,
                source: movie.source,
                isLocal: isLocal
            });
        }

        const rating = movie.average_rating != null ? movie.average_rating.toFixed(1) :
                      movie.tmdb_rating != null ? movie.tmdb_rating.toFixed(1) : 'N/A';
        const posterUrl = movie.poster_image_url || movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster';
        const badge = isLocal ? '<span class="bg-green-600 text-xs px-2 py-1 rounded">Our Collection</span>' :
                                '<span class="bg-blue-600 text-xs px-2 py-1 rounded">TMDb</span>';

        if (isLocal) {
            // LOCAL MOVIE - Navigate to detail page
            return `
            <a href="/movies/${movie.id}/" class="movie-card block">
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
                    <div class="mt-2 w-full bg-primary hover:bg-red-700 text-center text-xs py-2 rounded transition">
                        View Details
                    </div>
                </div>
            </a>
            `;
        } else {
            // TMDB MOVIE - Open modal (use tmdb_id, NOT id)
            const tmdbId = movie.tmdb_id || movie.id;
            return `
            <div class="movie-card cursor-pointer" onclick="event.preventDefault(); viewTMDbMovie(${tmdbId});">
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
                    <div class="mt-2 w-full bg-primary hover:bg-red-700 text-center text-xs py-2 rounded transition">
                        View Details
                    </div>
                </div>
            </div>
            `;
        }
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
 * View TMDb movie details in modal
 */
async function viewTMDbMovie(tmdbId) {
    const modal = document.getElementById('movieModal');
    const modalContent = document.getElementById('modalContent');

    // Show loading state
    modal.classList.remove('hidden');
    modalContent.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p class="mt-4 text-gray-400">Loading movie details...</p>
        </div>
    `;

    try {
        const response = await API.movies.tmdb.getDetails(tmdbId);
        const movie = response.data;

        const genres = movie.genres ? movie.genres.join(', ') : 'N/A';
        const rating = movie.tmdb_rating ? movie.tmdb_rating.toFixed(1) : 'N/A';
        const runtime = movie.runtime ? `${movie.runtime} minutes` : 'N/A';

        modalContent.innerHTML = `
            <!-- Close Button -->
            <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                &times;
            </button>

            <!-- Movie Header with Backdrop -->
            <div class="relative -m-6 mb-6">
                ${movie.backdrop_url ? `
                    <img src="${movie.backdrop_url}" alt="${movie.title}" class="w-full h-64 object-cover rounded-t-lg">
                    <div class="absolute inset-0 bg-gradient-to-t from-secondary to-transparent"></div>
                ` : ''}
                <div class="absolute bottom-4 left-6 right-6">
                    <h2 class="text-4xl font-bold mb-2">${movie.title}</h2>
                    <div class="flex items-center space-x-4 text-sm">
                        <span class="bg-primary px-3 py-1 rounded">⭐ ${rating}</span>
                        <span>${movie.release_year || 'N/A'}</span>
                        <span>${runtime}</span>
                    </div>
                </div>
            </div>

            <!-- Movie Content -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Poster -->
                <div>
                    <img
                        src="${movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}"
                        alt="${movie.title}"
                        class="w-full rounded-lg shadow-lg"
                        onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                    >
                </div>

                <!-- Details -->
                <div class="md:col-span-2 space-y-4">
                    <div>
                        <h3 class="text-lg font-semibold text-primary mb-2">Overview</h3>
                        <p class="text-gray-300">${movie.description || 'No description available.'}</p>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-primary mb-2">Genres</h3>
                        <p class="text-gray-300">${genres}</p>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold text-primary mb-2">Language</h3>
                        <p class="text-gray-300">${movie.language || 'N/A'}</p>
                    </div>

                    ${movie.homepage ? `
                        <div>
                            <h3 class="text-lg font-semibold text-primary mb-2">Official Website</h3>
                            <a href="${movie.homepage}" target="_blank" class="text-blue-400 hover:underline">
                                ${movie.homepage}
                            </a>
                        </div>
                    ` : ''}

                    <!-- Action Buttons -->
                    <div class="flex space-x-4 pt-4">
                        <button
                            onclick="importTMDbMovie(${tmdbId})"
                            class="flex-1 bg-primary hover:bg-red-700 px-6 py-3 rounded-lg transition font-semibold"
                        >
                            📥 Import to Our Collection
                        </button>
                        <button
                            onclick="closeModal()"
                            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Failed to load movie details:', error);
        modalContent.innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500 text-xl mb-4">Failed to load movie details</p>
                <button
                    onclick="closeModal()"
                    class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                    Close
                </button>
            </div>
        `;
    }
}

/**
 * Close the movie modal
 */
function closeModal() {
    document.getElementById('movieModal').classList.add('hidden');
}

/**
 * Import TMDb movie to local database
 */
async function importTMDbMovie(tmdbId) {
    const modalContent = document.getElementById('modalContent');

    // Show loading state
    modalContent.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p class="mt-4 text-gray-400">Importing movie to collection...</p>
        </div>
    `;

    try {
        await API.movies.tmdb.import(tmdbId);

        // Show success message
        modalContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">✅</div>
                <p class="text-2xl font-bold text-green-500 mb-2">Movie Imported Successfully!</p>
                <p class="text-gray-400 mb-6">The movie has been added to your collection.</p>
                <button
                    onclick="closeModal(); if (currentSource === 'local' || currentSource === 'all') loadMovies();"
                    class="px-6 py-3 bg-primary hover:bg-red-700 rounded-lg transition font-semibold"
                >
                    Close
                </button>
            </div>
        `;

        // Auto-close after 2 seconds and reload
        setTimeout(() => {
            closeModal();
            if (currentSource === 'local' || currentSource === 'all') {
                loadMovies();
            }
        }, 2000);
    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message || 'Unknown error';

        // Show error message
        modalContent.innerHTML = `
            <div class="text-center py-8">
                <div class="text-6xl mb-4">❌</div>
                <p class="text-2xl font-bold text-red-500 mb-2">Import Failed</p>
                <p class="text-gray-400 mb-6">${errorMsg}</p>
                <button
                    onclick="closeModal()"
                    class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                    Close
                </button>
            </div>
        `;
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
window.closeModal = closeModal;
window.importTMDbMovie = importTMDbMovie;

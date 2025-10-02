/**
 * Movie list page JavaScript
 */

let currentPage = 1;
let currentSource = 'local'; // 'local' or 'tmdb'
let currentFilters = {};

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadGenres();
    await loadMovies();

    // Set up event listeners
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 500));
    document.getElementById('genreFilter').addEventListener('change', handleFilterChange);
    document.getElementById('sortBy').addEventListener('change', handleFilterChange);
});

/**
 * Load genres for filter dropdown
 */
async function loadGenres() {
    try {
        const response = await API.movies.getGenres();
        const genres = response.data;

        const genreFilter = document.getElementById('genreFilter');
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            genreFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load genres:', error);
    }
}

/**
 * Load movies based on current source and filters
 */
async function loadMovies() {
    showLoading(true);
    hideNoResults();

    try {
        let response;

        if (currentSource === 'local') {
            // Load from local database
            const params = {
                page: currentPage,
                ...currentFilters
            };
            response = await API.movies.list(params);
            displayLocalMovies(response.data);

        } else {
            // Load from TMDb
            const sortBy = currentFilters.sort || 'popular';

            if (sortBy === 'popular') {
                response = await API.movies.tmdb.popular(currentPage);
            } else if (sortBy === 'top_rated') {
                response = await API.movies.tmdb.topRated(currentPage);
            } else {
                response = await API.movies.tmdb.popular(currentPage);
            }

            displayTMDbMovies(response.data);
        }
    } catch (error) {
        console.error('Failed to load movies:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

/**
 * Display local movies
 */
function displayLocalMovies(movies) {
    const grid = document.getElementById('movieGrid');

    if (!movies || movies.length === 0) {
        showNoResults();
        return;
    }

    grid.innerHTML = movies.map(movie => `
        <a href="/movies/${movie.id}/" class="movie-card">
            <div class="relative">
                <img
                    src="${movie.poster_image_url || 'https://via.placeholder.com/300x450?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-full h-auto rounded-lg shadow-lg"
                    onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                >
                <div class="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                    <span class="text-xs star-rating">⭐ ${movie.average_rating.toFixed(1)}</span>
                </div>
            </div>
            <div class="mt-2">
                <h3 class="font-semibold text-sm truncate" title="${movie.title}">${movie.title}</h3>
                <p class="text-xs text-gray-400">${movie.release_year || 'N/A'}</p>
                ${movie.genres && movie.genres.length > 0 ? `
                    <p class="text-xs text-gray-500 truncate">${movie.genres.map(g => g.name).join(', ')}</p>
                ` : ''}
            </div>
        </a>
    `).join('');
}

/**
 * Display TMDb movies
 */
function displayTMDbMovies(data) {
    const grid = document.getElementById('movieGrid');
    const movies = data.results;

    if (!movies || movies.length === 0) {
        showNoResults();
        return;
    }

    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div class="relative">
                <img
                    src="${movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-full h-auto rounded-lg shadow-lg"
                    onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                >
                <div class="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded">
                    <span class="text-xs star-rating">⭐ ${movie.tmdb_rating?.toFixed(1) || 'N/A'}</span>
                </div>
            </div>
            <div class="mt-2">
                <h3 class="font-semibold text-sm truncate" title="${movie.title}">${movie.title}</h3>
                <p class="text-xs text-gray-400">${movie.release_year || 'N/A'}</p>
                <button
                    onclick="viewTMDbMovie(${movie.tmdb_id})"
                    class="mt-2 w-full bg-primary hover:bg-red-700 text-xs py-1 rounded transition"
                >
                    View Details
                </button>
            </div>
        </div>
    `).join('');

    // Display pagination for TMDb
    displayPagination(data.page, data.total_pages);
}

/**
 * Display pagination controls
 */
function displayPagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const maxPages = Math.min(totalPages, 10);
    let html = '';

    // Previous button
    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">Previous</button>`;
    }

    // Page numbers
    for (let i = 1; i <= maxPages; i++) {
        const active = i === currentPage ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600';
        html += `<button onclick="goToPage(${i})" class="px-4 py-2 ${active} rounded">${i}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">Next</button>`;
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
 * Set source (local or TMDb)
 */
function setSource(source) {
    currentSource = source;
    currentPage = 1;

    // Update button styles
    const btnLocal = document.getElementById('btnLocal');
    const btnTmdb = document.getElementById('btnTmdb');

    if (source === 'local') {
        btnLocal.className = 'px-6 py-2 bg-primary rounded-lg transition';
        btnTmdb.className = 'px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition';
    } else {
        btnLocal.className = 'px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition';
        btnTmdb.className = 'px-6 py-2 bg-primary rounded-lg transition';
    }

    loadMovies();
}

/**
 * Handle search input
 */
function handleSearch(e) {
    const query = e.target.value.trim();

    if (query) {
        currentFilters.search = query;
    } else {
        delete currentFilters.search;
    }

    currentPage = 1;
    loadMovies();
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
    const genre = document.getElementById('genreFilter').value;
    const sortBy = document.getElementById('sortBy').value;

    currentFilters = {};

    if (genre) {
        currentFilters.genre = genre;
    }

    if (sortBy) {
        currentFilters.sort = sortBy;
    }

    currentPage = 1;
    loadMovies();
}

/**
 * View TMDb movie details (opens modal or new page)
 */
async function viewTMDbMovie(tmdbId) {
    try {
        const response = await API.movies.tmdb.getDetails(tmdbId);
        const movie = response.data;

        // For now, show alert with details
        // In production, you'd show a modal or navigate to detail page
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

/**
 * Debounce utility function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions global
window.setSource = setSource;
window.goToPage = goToPage;
window.viewTMDbMovie = viewTMDbMovie;

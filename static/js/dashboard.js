/**
 * Dashboard page JavaScript
 */

// Load data on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadRecommendations();
    await loadWatchHistory();
    await loadChatHistory();
});

/**
 * Load personalized recommendations
 */
async function loadRecommendations() {
    const container = document.getElementById('recommendations');
    if (!container) return;

    try {
        const response = await API.recommendations.get(10);
        const recommendations = response.data.recommendations;

        if (recommendations.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8"><p>No recommendations available yet. Rate some movies to get started!</p></div>';
            return;
        }

        container.innerHTML = recommendations.map(movie => `
            <a href="/movies/${movie.tmdb_id}/" class="movie-card">
                <img
                    src="${movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}"
                    alt="${movie.title}"
                    class="w-full h-auto rounded-lg shadow-lg"
                    onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                >
                <div class="mt-2">
                    <h3 class="font-semibold text-sm truncate">${movie.title}</h3>
                    <p class="text-xs text-gray-400">${movie.release_year || 'N/A'} • ⭐ ${movie.tmdb_rating || 'N/A'}</p>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Failed to load recommendations:', error);
        container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8"><p>Failed to load recommendations</p></div>';
    }
}

/**
 * Load watch history
 */
async function loadWatchHistory() {
    const container = document.getElementById('watchHistory');
    if (!container) return;

    try {
        const response = await API.movies.watchHistory.list();
        const history = response.data;

        if (history.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-8"><p>No watch history yet</p></div>';
            return;
        }

        container.innerHTML = history.slice(0, 10).map(item => `
            <a href="/movies/${item.movie.id}/" class="movie-card">
                <img
                    src="${item.movie.poster_image_url || 'https://via.placeholder.com/300x450?text=No+Poster'}"
                    alt="${item.movie.title}"
                    class="w-full h-auto rounded-lg shadow-lg"
                    onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'"
                >
                <div class="mt-2">
                    <h3 class="font-semibold text-sm truncate">${item.movie.title}</h3>
                    <p class="text-xs text-gray-400">${item.movie.release_year || 'N/A'}</p>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Failed to load watch history:', error);
    }
}

/**
 * Toggle chat window
 */
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('hidden');
}

/**
 * Load chat history
 */
async function loadChatHistory() {
    try {
        const response = await API.recommendations.getChatHistory();
        const messages = response.data;

        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = messages.map(msg => {
            const isUser = msg.sender === 'user';
            return `
                <div class="${isUser ? 'text-right' : ''}">
                    <div class="inline-block ${isUser ? 'bg-primary' : 'bg-gray-700'} rounded-lg p-3 max-w-xs">
                        <p class="text-sm">${msg.message}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Failed to load chat history:', error);
    }
}

/**
 * Handle chat form submission
 */
document.getElementById('chatForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');

    // Add user message to chat
    chatMessages.innerHTML += `
        <div class="text-right">
            <div class="inline-block bg-primary rounded-lg p-3 max-w-xs">
                <p class="text-sm">${message}</p>
            </div>
        </div>
    `;

    // Clear input
    input.value = '';

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Send message to API
        const response = await API.recommendations.chat(message);
        const botResponse = response.data.bot_response.message;

        // Add bot response to chat
        chatMessages.innerHTML += `
            <div>
                <div class="inline-block bg-gray-700 rounded-lg p-3 max-w-xs">
                    <p class="text-sm">${botResponse}</p>
                </div>
            </div>
        `;

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Failed to send message:', error);
        chatMessages.innerHTML += `
            <div>
                <div class="inline-block bg-red-600 rounded-lg p-3 max-w-xs">
                    <p class="text-sm">Failed to send message. Please try again.</p>
                </div>
            </div>
        `;
    }
});

// Make functions global
window.toggleChat = toggleChat;
window.loadRecommendations = loadRecommendations;

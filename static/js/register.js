/**
 * Registration page JavaScript
 */

// Load genres on page load (only if genre selection exists)
document.addEventListener('DOMContentLoaded', async () => {
    const genreContainer = document.getElementById('genreSelection');
    if (genreContainer) {
        await loadGenres();
    }
});

/**
 * Load available genres from API
 */
async function loadGenres() {
    try {
        const response = await API.movies.getGenres();
        const genres = response.data;

        const genreContainer = document.getElementById('genreSelection');
        if (!genreContainer) return;

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
 * Handle registration form submission
 */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log('Registration form submitted');

        const submitBtn = document.getElementById('submitBtn');
        const errorMsg = document.getElementById('errorMessage');
        const successMsg = document.getElementById('successMessage');

        // Check if API is available
        if (typeof API === 'undefined') {
            console.error('API module not loaded!');
            errorMsg.textContent = 'Error: API module not loaded. Please refresh the page.';
            errorMsg.classList.remove('hidden');
            return;
        }

    // Hide messages
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password_confirm').value;

    // Validate passwords match
    if (password !== passwordConfirm) {
        errorMsg.textContent = 'Passwords do not match';
        errorMsg.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        return;
    }

    // Get selected genres (only if element exists - for user registration)
    const selectedGenres = [];
    const genreCheckboxes = document.querySelectorAll('#genreSelection input[type="checkbox"]:checked');
    genreCheckboxes.forEach(cb => {
        selectedGenres.push(cb.value);
    });

    // Get actors and languages (only if elements exist - for user registration)
    const actorsInput = document.getElementById('actors');
    const actors = actorsInput ? actorsInput.value
        .split(',')
        .map(a => a.trim())
        .filter(a => a) : [];

    const languagesInput = document.getElementById('languages');
    const languages = languagesInput ? languagesInput.value
        .split(',')
        .map(l => l.trim())
        .filter(l => l) : [];

    // Get user role from hidden input (admin or user)
    const role = document.getElementById('userRole').value || 'user';

    // Prepare registration data
    const registrationData = {
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        role: role
    };

    // Add preferences if provided
    if (selectedGenres.length > 0 || actors.length > 0 || languages.length > 0) {
        registrationData.preferences = {
            favorite_genres: selectedGenres,
            favorite_actors: actors,
            preferred_languages: languages
        };
    }

    console.log('Registration data:', registrationData);

    try {
        const response = await API.auth.register(registrationData);

        console.log('Registration successful:', response.data);

        // Show success message
        successMsg.textContent = 'Account created successfully! Redirecting to dashboard...';
        successMsg.classList.remove('hidden');

        // Store tokens (if using JWT)
        if (response.data.tokens) {
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
        }

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = '/dashboard/';
        }, 2000);

    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = handleAPIError(error);
        errorMsg.textContent = errorMessage;
        errorMsg.classList.remove('hidden');

        // Re-enable submit button
        submitBtn.disabled = false;

        // Get the correct button text based on role
        const role = document.getElementById('userRole')?.value || 'user';
        submitBtn.textContent = role === 'admin' ? 'Create Admin Account' : 'Create User Account';
    }
    });
} else {
    console.error('Register form not found!');
}

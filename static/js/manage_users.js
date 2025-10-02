/**
 * Manage Users page JavaScript
 */

let allUsers = [];
let filteredUsers = [];

// Load users on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();

    // Set up event listeners
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
});

/**
 * Load all users
 */
async function loadUsers() {
    showLoading(true);

    try {
        const response = await API.users.list();
        allUsers = response.data;
        filteredUsers = [...allUsers];
        displayUsers();
        document.getElementById('totalUsers').textContent = allUsers.length;
    } catch (error) {
        console.error('Failed to load users:', error);
        showNoResults();
    } finally {
        showLoading(false);
    }
}

/**
 * Display users in table
 */
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');

    if (filteredUsers.length === 0) {
        showNoResults();
        tbody.innerHTML = '';
        return;
    }

    hideNoResults();

    tbody.innerHTML = filteredUsers.map(user => `
        <tr class="border-t border-gray-700 hover:bg-gray-800">
            <td class="px-6 py-4">
                <div class="font-semibold">${user.username}</div>
            </td>
            <td class="px-6 py-4 text-gray-300">${user.email}</td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-yellow-600' : 'bg-blue-600'}">
                    ${user.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
            </td>
            <td class="px-6 py-4 text-gray-300">${new Date(user.date_joined).toLocaleDateString()}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-600' : 'bg-red-600'}">
                    ${user.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex space-x-2">
                    <button
                        onclick="editUser(${user.id})"
                        class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition"
                        title="Edit"
                    >
                        ✏️ Edit
                    </button>
                    ${!user.is_staff ? `
                    <button
                        onclick="toggleUserStatus(${user.id}, ${user.is_active})"
                        class="px-3 py-1 ${user.is_active ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} rounded text-sm transition"
                        title="${user.is_active ? 'Deactivate' : 'Activate'}"
                    >
                        ${user.is_active ? '🚫 Deactivate' : '✅ Activate'}
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Filter users based on search and role
 */
function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;

    filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    displayUsers();
}

/**
 * Edit user
 */
async function editUser(userId) {
    try {
        const response = await API.users.get(userId);
        const user = response.data;

        // Populate form
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRole').value = user.role;
        document.getElementById('editIsActive').checked = user.is_active;

        // Show modal
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to load user:', error);
        alert('Failed to load user details');
    }
}

/**
 * Handle edit form submission
 */
async function handleEditSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const messageEl = document.getElementById('editMessage');

    const data = {
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value,
        is_active: document.getElementById('editIsActive').checked,
    };

    try {
        await API.users.update(userId, data);

        messageEl.textContent = 'User updated successfully!';
        messageEl.className = 'p-4 rounded-lg bg-green-600 text-white';
        messageEl.classList.remove('hidden');

        setTimeout(() => {
            closeEditModal();
            loadUsers();
        }, 1500);
    } catch (error) {
        console.error('Failed to update user:', error);
        const errorMsg = handleAPIError(error);
        messageEl.textContent = `Failed to update: ${errorMsg}`;
        messageEl.className = 'p-4 rounded-lg bg-red-600 text-white';
        messageEl.classList.remove('hidden');
    }
}

/**
 * Toggle user active status
 */
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';

    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }

    try {
        await API.users.update(userId, { is_active: !currentStatus });
        alert(`User ${action}d successfully`);
        await loadUsers();
    } catch (error) {
        console.error('Failed to toggle user status:', error);
        const errorMsg = handleAPIError(error);
        alert(`Failed to ${action} user: ${errorMsg}`);
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
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.closeEditModal = closeEditModal;

# Admin Features - Frontend Management

All admin features are now accessible from the **frontend** without needing to use the Django admin dashboard!

## ✅ What's Been Created

### 1. **Upload Movie** (`/admin/upload/`)
**Features:**
- ✅ Manual movie upload with form
- ✅ Import movies from TMDb API
- ✅ Upload poster images
- ✅ Add trailer URLs
- ✅ Categorize by genres
- ✅ Add cast and director info

**How to Access:**
1. Login as admin
2. Click "Upload Movie" on dashboard
3. Choose "Manual Upload" or "Import from TMDb"

### 2. **Manage Movies** (`/admin/manage-movies/`)
**Features:**
- ✅ View all movies in a table
- ✅ Search movies by title
- ✅ Filter by source (Admin/TMDb)
- ✅ **Edit** movie details (title, description, year, runtime, etc.)
- ✅ **Delete** movies
- ✅ View movie details

**Available Actions:**
- 👁️ **View** - Opens movie detail page
- ✏️ **Edit** - Edit movie in modal popup
- 🗑️ **Delete** - Delete movie (with confirmation)

**How to Access:**
1. Login as admin
2. Click "Manage Movies" on dashboard
3. Browse, search, and manage your movies

### 3. **Manage Users** (`/admin/manage-users/`)
**Features:**
- ✅ View all registered users
- ✅ Search by username or email
- ✅ Filter by role (Admin/User)
- ✅ **Edit** user details (email, role, status)
- ✅ **Activate/Deactivate** users
- ✅ View user statistics

**Available Actions:**
- ✏️ **Edit** - Change email, role, or active status
- 🚫 **Deactivate** - Disable user account
- ✅ **Activate** - Enable user account

**How to Access:**
1. Login as admin
2. Click "Manage Users" on dashboard
3. View and manage all users

## 🎯 URLs Reference

| Feature | URL | Description |
|---------|-----|-------------|
| Upload Movie | `/admin/upload/` | Upload or import movies |
| Manage Movies | `/admin/manage-movies/` | Edit/delete movies |
| Manage Users | `/admin/manage-users/` | Manage user accounts |
| Dashboard | `/dashboard/` | Admin dashboard |

## 🔑 Permissions

All admin features require:
- ✅ User must be logged in
- ✅ User role must be `admin`
- ✅ API endpoints check for admin role

If a non-admin tries to access these pages, they'll see a 403 error.

## 📝 How Each Feature Works

### Upload Movie

**Manual Upload:**
1. Fill in movie details (title, description, year, etc.)
2. Upload a poster image
3. Add trailer URL (YouTube)
4. Select genres
5. Click "Upload Movie"

**TMDb Import:**
1. Switch to "Import from TMDb" tab
2. Search for a movie
3. Click "Import to Collection"
4. Movie data automatically filled from TMDb

### Manage Movies

**View Movies:**
- All movies displayed in a table
- Shows poster, title, year, source, rating
- Search bar for filtering

**Edit Movie:**
1. Click ✏️ Edit button
2. Modal opens with movie details
3. Update any field
4. Click "Save Changes"

**Delete Movie:**
1. Click 🗑️ Delete button
2. Confirm deletion
3. Movie permanently removed

### Manage Users

**View Users:**
- All users in a table
- Shows username, email, role, join date, status

**Edit User:**
1. Click ✏️ Edit button
2. Modal opens with user details
3. Change email, role, or active status
4. Click "Save Changes"

**Toggle Status:**
- Click Deactivate/Activate button
- Deactivated users cannot log in

## 🔧 API Endpoints

### Movies API
```
GET    /api/movies/              - List all movies
GET    /api/movies/{id}/         - Get movie details
POST   /api/movies/create/       - Create movie
PUT    /api/movies/{id}/update/  - Update movie
DELETE /api/movies/{id}/delete/  - Delete movie
```

### Users API
```
GET    /api/users/               - List all users
GET    /api/users/{id}/          - Get user details
PUT    /api/users/{id}/update/   - Update user
DELETE /api/users/{id}/delete/   - Delete user
```

## 🚀 Testing the Features

### 1. Test Upload Movie
```bash
# Login as admin
# Go to http://127.0.0.1:8000/admin/upload/
# Try uploading a movie manually
```

### 2. Test Manage Movies
```bash
# Go to http://127.0.0.1:8000/admin/manage-movies/
# Edit a movie
# Delete a movie
```

### 3. Test Manage Users
```bash
# Go to http://127.0.0.1:8000/admin/manage-users/
# Edit a user's role
# Deactivate/activate a user
```

## 🎨 Features Highlights

✅ **No Django Admin Required** - Everything in frontend
✅ **Beautiful UI** - Tailwind CSS styled
✅ **Real-time Updates** - Instant feedback
✅ **Modal Editing** - Edit without page reload
✅ **Confirmation Dialogs** - Prevent accidental deletes
✅ **Search & Filter** - Find content quickly
✅ **Responsive Design** - Works on all devices

## 🔐 Security

- All admin endpoints protected by authentication
- Role-based access control
- CSRF token validation
- Cannot delete superusers
- Cannot delete yourself

---

**All admin features are now fully functional from the frontend! 🎉**

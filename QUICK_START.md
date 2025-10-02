# Quick Start Guide - FigFlix

## ✅ Setup Complete! Here's What to Do:

### 1. Start the Development Server
```bash
python manage.py runserver
```

### 2. Test Admin Registration

**Navigate to:** `http://127.0.0.1:8000/register/admin/`

**Fill the form:**
- Username: `myadmin`
- Email: `myadmin@figflix.com`
- Password: `MyAdmin123!`
- Confirm Password: `MyAdmin123!`

**Click:** "Create Admin Account"

**Expected:**
- ✅ Green success message
- ✅ Redirect to dashboard in 2 seconds
- ✅ See "👑 ADMIN" badge on dashboard

### 3. Test User Registration

**Navigate to:** `http://127.0.0.1:8000/register/user/`

**Fill the form:**
- Username: `myuser`
- Email: `myuser@figflix.com`
- Password: `MyUser123!`
- Confirm Password: `MyUser123!`
- *(Optional)* Select some favorite genres
- *(Optional)* Add favorite actors: "Tom Hanks, Denzel Washington"
- *(Optional)* Add languages: "English"

**Click:** "Create User Account"

**Expected:**
- ✅ Green success message
- ✅ Redirect to dashboard in 2 seconds
- ✅ See "👤 USER" badge on dashboard

### 4. Test Login

**Navigate to:** `http://127.0.0.1:8000/login/`

**Try admin login:**
- Username: `myadmin`
- Password: `MyAdmin123!`

**Expected:**
- ✅ Redirect to dashboard
- ✅ See admin features (Upload Movie, Admin Panel links)

### 5. If Something Goes Wrong

**Open Browser Console (F12)**

Look for these messages:
- ✅ "API module loaded: true"
- ✅ "Registration form submitted"
- ✅ "Registration data: {...}"
- ✅ "Registration successful: {...}"

**If you see errors:**

1. **"API module not loaded"**
   - Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

2. **"Register form not found"**
   - Check if you're on the correct page URL

3. **Network errors**
   - Ensure Django server is running
   - Check Django console for errors

4. **CSRF errors**
   - Clear cookies and refresh

### 6. Common Debug Steps

```bash
# If database errors
python manage.py migrate

# If static files not loading
python manage.py collectstatic --noinput

# Create a test admin via command line
echo "from accounts.models import User; User.objects.create_superuser('admin', 'admin@test.com', 'admin123', role='admin')" | python manage.py shell
```

### 7. URLs Reference

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Redirects to login |
| Login | `/login/` | User/Admin login |
| User Reg | `/register/user/` | Register as User |
| Admin Reg | `/register/admin/` | Register as Admin |
| Dashboard | `/dashboard/` | Role-based dashboard |
| Movies | `/movies/` | Browse movies |
| Admin Upload | `/admin/upload/` | Upload movies (admin only) |
| Django Admin | `/admin/` | Django admin panel |

### 8. Next Steps After Registration Works

1. **Add TMDb API Key** to `.env`:
   ```env
   TMDB_API_KEY=your_actual_api_key_here
   ```

2. **Sync Genres** (run in Django shell):
   ```python
   from movies.tmdb_service import tmdb_service
   from movies.models import Genre

   genres = tmdb_service.get_genres()
   for g in genres:
       Genre.objects.get_or_create(tmdb_id=g['id'], defaults={'name': g['name']})
   ```

3. **Test Features**:
   - Upload a movie (as admin)
   - Search TMDb and import
   - Rate and review movies
   - Chat with AI bot

---

## 🎉 You're All Set!

The registration feature is now fully functional with:
- ✅ Separate User and Admin registration
- ✅ Role-based dashboards
- ✅ Visual role indicators
- ✅ Proper error handling
- ✅ Console debugging support

**Enjoy building with FigFlix!** 🎬

# 🚀 Quick Start - TMDb Integration

## Your TMDb API is Ready!

Everything has been set up and secured. Here's how to start using it:

## 1️⃣ Start the Server

```bash
python manage.py runserver
```

## 2️⃣ Visit the Home Page

Open your browser and go to:
- **Home**: http://127.0.0.1:8000/
- **Or**: http://127.0.0.1:8000/home/

## 3️⃣ What You'll See

### 🏠 Home Page Features:
- **Hero Section**: Beautiful search bar at the top
- **Three Tabs**:
  - `All Movies` - Shows BOTH admin-uploaded + TMDb movies
  - `Our Collection` - Only your admin-uploaded movies
  - `TMDb Popular` - Only popular movies from TMDb

### 🔍 Search:
- Type movie name in search bar
- Press Enter or click "Search"
- Results from BOTH databases appear

### 📄 Pagination:
- 20 movies per page automatically
- Previous/Next buttons at bottom

## 4️⃣ Test the Integration

### Quick Test:
1. Go to home page
2. You should see TMDb popular movies loading automatically
3. Try searching for "Inception" or "Avatar"
4. Both local and TMDb results will show

### Verify API is Working:
```bash
python manage.py shell -c "from movies.tmdb_service import tmdb_service; result = tmdb_service.get_popular_movies(1); print('✅ TMDb API Working!' if result else '❌ Failed'); print(f'Found {len(result.get(\"results\", []))} movies')"
```

Expected output:
```
✅ TMDb API Working!
Found 20 movies
```

## 5️⃣ Features Overview

### For All Users:
- ✅ Browse TMDb popular movies
- ✅ Search across all movies
- ✅ See ratings and posters
- ✅ View movie details
- ✅ Filter by source

### For Logged-In Users:
- ✅ Import TMDb movies to collection
- ✅ Rate and review movies
- ✅ Track watch history

### For Admins:
- ✅ Upload custom movies at `/upload/`
- ✅ Manage all movies at `/manage-movies/`
- ✅ Manage users at `/manage-users/`

## 🔒 Security Checklist

✅ **API Key Secured**:
- Stored in `.env` file
- `.env` is in `.gitignore`
- Won't be pushed to GitHub

✅ **Safe to Commit**:
- All code files
- Templates and JavaScript
- Settings.py (uses env variables)

❌ **Never Commit**:
- `.env` file
- Database files
- Media uploads

## 📊 Available Endpoints

### TMDb Movies (via your backend):
```
GET  /api/movies/tmdb/popular/           # Popular movies
GET  /api/movies/tmdb/top-rated/         # Top rated
GET  /api/movies/tmdb/search/?q=query    # Search
GET  /api/movies/tmdb/{id}/              # Movie details
POST /api/movies/tmdb/{id}/import/       # Import movie
```

### Local Movies:
```
GET    /api/movies/                      # List all (paginated, 20/page)
GET    /api/movies/?search=query         # Search local
POST   /api/movies/create/               # Upload (admin)
PUT    /api/movies/{id}/update/          # Update (admin)
DELETE /api/movies/{id}/delete/          # Delete (admin)
```

## 🎯 What's Working Now

### ✅ Completed Features:
1. TMDb API integrated with your key: `f00fa539...` (secured)
2. Home page displays both local + TMDb movies
3. Search works across both databases
4. Pagination: 20 movies per page
5. Filter by source (All/Local/TMDb)
6. Import TMDb movies to your collection
7. Ratings displayed for all movies
8. Beautiful UI with Tailwind CSS
9. Responsive design (mobile-friendly)
10. All sensitive data protected from Git

### 🎨 UI Features:
- Gradient hero section
- Real-time search bar
- Movie posters from TMDb
- Source badges (Our Collection vs TMDb)
- Hover animations
- Loading indicators
- Empty state messages

## 💡 Usage Tips

### Search Tips:
- Search works on: title, actor, director
- Results show from BOTH local and TMDb
- Use filter tabs to narrow results

### Import Movies:
1. Click "View Details" on any TMDb movie
2. See movie information
3. Click "Yes" to import to your collection
4. Movie appears in "Our Collection"

### Admin Features:
- Upload movies manually at `/upload/`
- Manage all movies at `/manage-movies/`
- Edit/delete any movie
- Manage users at `/manage-users/`

## 🐛 Troubleshooting

### No TMDb movies showing:
1. Check Django server is running
2. Verify `.env` has correct API key
3. Restart server: `Ctrl+C` then `python manage.py runserver`
4. Check browser console for errors (F12)

### Search not working:
1. Clear browser cache: `Ctrl + Shift + R`
2. Verify JavaScript loaded: Check Network tab (F12)
3. Check Django console for errors

### Import fails:
1. Make sure you're logged in
2. Admin users can import movies
3. Check network tab for API errors

## 📝 File Locations

### Templates:
- Home page: `/templates/movies/home.html`
- Base layout: `/templates/base.html`

### JavaScript:
- Home page JS: `/static/js/home.js`
- API client: `/static/js/api.js`

### Backend:
- Views: `/movies/views.py`
- TMDb service: `/movies/tmdb_service.py`
- Settings: `/figflix/settings.py`

### Configuration:
- Environment: `/.env` (SECURED, not in Git)
- Example: `/.env.example` (template)

## 🎉 You're All Set!

Your FigFlix application now has:
- ✅ Full TMDb integration
- ✅ Dynamic home page
- ✅ Search functionality
- ✅ Pagination (20/page)
- ✅ Both local and TMDb movies
- ✅ Secure API key storage

**Start the server and visit http://127.0.0.1:8000/ to see it in action!** 🚀

---

**Need help?** Check:
- `TMDB_INTEGRATION.md` - Detailed documentation
- `README.md` - Full project documentation
- Django console - Error messages
- Browser console (F12) - Frontend errors

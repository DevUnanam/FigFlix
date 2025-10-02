# 🔧 Fix for TMDb Movie Click Error

## The Problem
When clicking on TMDb movies (from API), you're getting a 404 error because the browser is using **cached old JavaScript** that treats TMDb movies as local movies.

## The Solution - Clear Browser Cache

### Method 1: Hard Refresh (RECOMMENDED)
1. **Close all browser tabs** for http://127.0.0.1:8000
2. **Open the site fresh**: http://127.0.0.1:8000/
3. **Hard refresh**: Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
4. **Check Console**: Press `F12` → Console tab → Look for "Movie Debug" logs

### Method 2: Clear Browser Cache Completely
1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data from "All time"
5. Restart browser
6. Visit http://127.0.0.1:8000/

### Method 3: Use Incognito/Private Window
1. Open an Incognito/Private window
2. Go to http://127.0.0.1:8000/
3. Test clicking on movies

## How to Verify It's Fixed

After clearing cache, you should see:

### ✅ Local Movies (Our Collection):
- **Badge**: 🟢 Green "Our Collection"
- **Click behavior**: Opens detail page at `/movies/1/`
- **URL changes**: Yes

### ✅ TMDb Movies:
- **Badge**: 🔵 Blue "TMDb"
- **Click behavior**: Opens beautiful modal popup
- **URL changes**: No (stays on home page)
- **Modal shows**: Movie poster, description, rating, Import button

## Debugging

### Check JavaScript is Loading:
1. Press `F12` to open Developer Tools
2. Go to "Network" tab
3. Refresh page (`Ctrl + Shift + R`)
4. Look for `home.js?v=20251002fix`
5. Should show status `200` and size > 10KB

### Check Console for Errors:
1. Press `F12` → Console tab
2. Click on a movie
3. Should see "Movie Debug:" logs showing:
   ```
   Movie Debug: {
     title: "Movie Name",
     id: undefined (for TMDb) or 1 (for local),
     tmdb_id: 1267319 (large number for TMDb),
     source: "tmdb" or "admin",
     isLocal: false (for TMDb) or true (for local)
   }
   ```

### Still Getting 404?

If you still see `/127.0.0.1:8000/movies/1267319/` error:

1. **Browser is STILL using old cache**
   - Try Method 2 or 3 above
   - Or use a different browser

2. **Check the badge color**:
   - If TMDb movie shows GREEN badge → Cache issue
   - If TMDb movie shows BLUE badge → Click should work

3. **Check onclick in HTML**:
   - Right-click on a TMDb movie → Inspect
   - Look for: `onclick="event.preventDefault(); viewTMDbMovie(1267319);"`
   - If you see `href="/movies/1267319/"` → Old cached JavaScript

## Expected Behavior After Fix

### Scenario 1: Click on "test movie" (ID: 1)
```
✅ Green badge visible
✅ Click → Navigate to /movies/1/
✅ See full movie detail page
✅ Can rate and review
```

### Scenario 2: Click on TMDb movie (e.g., ID: 1267319)
```
✅ Blue badge visible
✅ Click → Modal opens
✅ URL stays at /home/
✅ Modal shows: poster, title, rating, overview
✅ Can click "Import to Collection" button
✅ Can close modal with X or click outside
```

## Technical Details (What Was Fixed)

### Code Changes:
1. **Better movie detection**:
   ```javascript
   const isLocal = (movie.source === 'local' || movie.source === 'admin') && hasLocalId;
   ```

2. **Separate rendering**:
   - Local movies: `<a href="/movies/{id}/">` (link)
   - TMDb movies: `<div onclick="viewTMDbMovie({tmdb_id})">` (modal)

3. **Cache busting**:
   - Changed script to: `home.js?v=20251002fix`

### Files Modified:
- `/static/js/home.js` - Fixed movie detection logic
- `/templates/movies/home.html` - Added cache buster

## Still Having Issues?

1. **Restart Django server**:
   ```bash
   # Stop server (Ctrl+C)
   python manage.py runserver
   ```

2. **Check server logs** for errors

3. **Try different browser** (Chrome, Firefox, Edge)

4. **Disable browser extensions** temporarily

---

## Quick Test Checklist

After clearing cache:

- [ ] Hard refresh with `Ctrl + Shift + R`
- [ ] Open Developer Tools (`F12`)
- [ ] Check Network tab shows `home.js?v=20251002fix`
- [ ] Click on a movie with BLUE badge
- [ ] Modal should open (not navigate)
- [ ] Check Console shows "Movie Debug" logs
- [ ] Click on a movie with GREEN badge
- [ ] Should navigate to `/movies/1/`

**If all checkboxes pass, the fix is working!** ✅

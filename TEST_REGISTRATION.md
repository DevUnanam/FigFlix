# Testing Registration Feature

## Steps to Test Admin Registration

1. **Open your browser** and navigate to: `http://127.0.0.1:8000/register/admin/`

2. **Open Browser Developer Tools** (Press F12 or right-click → Inspect)

3. **Go to the Console tab** to see debug messages

4. **Fill in the form:**
   - Username: `testadmin`
   - Email: `testadmin@example.com`
   - Password: `Admin123!`
   - Confirm Password: `Admin123!`

5. **Click "Create Admin Account"** button

6. **Check the console** for:
   - "API module loaded: true"
   - "Registration form submitted"
   - "Registration data: {...}" (should show your form data with role='admin')

## Expected Behavior

### Success:
- Console shows: "Registration successful"
- Green success message appears: "Account created successfully! Redirecting to dashboard..."
- After 2 seconds, redirected to `/dashboard/`
- Dashboard shows "👑 ADMIN" badge

### If Error Occurs:

#### "API module not loaded"
- **Fix**: Hard refresh the page (Ctrl + Shift + R)
- **Cause**: JavaScript files not loading properly

#### "Passwords do not match"
- **Fix**: Make sure both password fields are identical

#### API Error (400/500)
- **Check Console** for the actual error message
- **Common causes**:
  - Username already exists
  - Email already exists
  - Invalid data format

## Debug Checklist

If the button does nothing:

1. **Check Console** for JavaScript errors
2. **Verify API is loaded**: Look for "API module loaded: true" in console
3. **Check Network tab**: See if POST request to `/api/register/` is made
4. **Clear browser cache** and reload
5. **Try incognito/private window**

## Manual API Test

You can test the API directly using curl:

```bash
curl -X POST http://127.0.0.1:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin2",
    "email": "testadmin2@example.com",
    "password": "Admin123!",
    "password_confirm": "Admin123!",
    "role": "admin"
  }'
```

Expected response:
```json
{
  "user": {...},
  "tokens": {...},
  "message": "User registered successfully"
}
```

## Common Issues and Solutions

### Issue: Button click does nothing
**Solution**:
- Check browser console for errors
- Ensure `/static/js/api.js` is loaded (check Network tab)
- Hard refresh (Ctrl + Shift + R)

### Issue: "CSRF token missing"
**Solution**:
- The page should have `{% csrf_token %}` in the form
- Check cookies in DevTools → Application → Cookies

### Issue: "No such table: accounts_user"
**Solution**:
```bash
python manage.py migrate
```

### Issue: Form submits but no response
**Solution**:
- Check Django server console for errors
- Check browser Network tab for the API response
- Look for 400/500 status codes

## Success Indicators

✅ Console: "Registration form submitted"
✅ Console: "Registration data: {role: 'admin', ...}"
✅ Console: "Registration successful"
✅ Green message: "Account created successfully!"
✅ Redirect to dashboard with admin badge

If you see all these, registration is working! 🎉

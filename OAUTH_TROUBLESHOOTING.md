# OAuth Redirect URI Troubleshooting

If you're getting redirect URI mismatch errors, follow these steps:

## Common Errors

- **Spotify:** `INVALID_CLIENT: Invalid redirect URI`
- **Google/YouTube:** `Error 400: redirect_uri_mismatch`

## The Fix

The redirect URI in your OAuth app settings must **exactly match** what's in the code.

### Required Redirect URIs

Make sure these EXACT URLs are added to your OAuth apps:

#### Google Calendar & YouTube
```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/youtube/callback
```

#### Spotify
```
http://localhost:3000/api/auth/spotify/callback
```

#### Raindrop
```
http://localhost:3000/api/auth/raindrop/callback
```

### For Production
Add your production URLs too:
```
https://yourdomain.com/api/auth/google/callback
https://yourdomain.com/api/auth/youtube/callback
https://yourdomain.com/api/auth/spotify/callback
https://yourdomain.com/api/auth/raindrop/callback
```

## Step-by-Step Fix

### Google Calendar & YouTube Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. In **Authorized redirect URIs**, make sure you have:
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3000/api/auth/youtube/callback
   ```
5. **Important:** 
   - No trailing slashes
   - Use `http` (not `https`) for localhost
   - Use `https` for production
   - Match the exact path `/api/auth/[service]/callback`
6. Click **Save**
7. Wait a few minutes for changes to propagate (sometimes takes 5-10 minutes)

### Spotify Fix

**Common Error:** "This redirect URI is not secure"

This happens because Spotify has restrictions on localhost redirect URIs.

**Solutions:**

1. **Use `127.0.0.1` instead of `localhost`:**
   ```
   http://127.0.0.1:3000/api/auth/spotify/callback
   ```

2. **Make sure you're using an allowed port:**
   - Spotify allows: 3000, 3001, 8080, 8888, and some others
   - If port 3000 doesn't work, try 3001 or 8080

3. **Ensure your app is in Development mode:**
   - In Spotify Developer Dashboard, check your app status
   - Development mode allows `http://localhost` and `http://127.0.0.1`
   - Production mode requires HTTPS for non-localhost URLs

4. **Force your dev server to use port 3000:**
   - In `package.json`, change:
     ```json
     "dev": "next dev -p 3000"
     ```
   - Or run: `npm run dev -- -p 3000`

**Step-by-step:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Click **Edit Settings**
4. In **Redirect URIs**, click **Add** button
5. Try these in order:
   - First try: `http://localhost:3000/api/auth/spotify/callback`
   - If error: `http://127.0.0.1:3000/api/auth/spotify/callback`
   - If still error: `http://localhost:8080/api/auth/spotify/callback` (and change your dev server port)
6. Click **Add** after entering (don't just type)
7. Add production URI: `https://yourdomain.com/api/auth/spotify/callback`
8. Click **Save**
9. Wait a few minutes for changes to propagate

### Raindrop Fix

1. Go to [Raindrop Settings](https://app.raindrop.io/settings/integrations)
2. Find your app and click **Edit**
3. In **Redirect URI**, make sure you have:
   ```
   http://localhost:3000/api/auth/raindrop/callback
   ```
4. **Important:**
   - No trailing slashes
   - Use `http` (not `https`) for localhost
   - Use `https` for production
5. Click **Save**

## Common Mistakes

❌ **Wrong:**
- `http://localhost:3000/api/auth/google/callback/` (trailing slash)
- `https://localhost:3000/api/auth/google/callback` (https on localhost)
- `http://localhost:3000/api/auth/Google/callback` (wrong case)
- `http://127.0.0.1:3000/api/auth/google/callback` (different localhost format)
- `http://localhost:3000/api/auth/google/callback?foo=bar` (query params)

✅ **Correct:**
- `http://localhost:3000/api/auth/google/callback` (exact match)

## Verification Steps

1. **Check what port you're using:**
   ```bash
   # If you run `npm run dev`, check what port it starts on
   # Default is 3000, but might be different if 3000 is busy
   ```

2. **Verify your dev server is running on the correct port:**
   - Look at terminal output when you run `npm run dev`
   - It should show: `Local: http://localhost:3000`

3. **Check your OAuth app settings:**
   - Copy the redirect URI from the code
   - Paste it exactly (no modifications) into OAuth app settings
   - Save and wait a few minutes

4. **Test again:**
   - Clear browser cache/cookies
   - Try the OAuth flow again

## Still Not Working?

### For Google/YouTube:
1. Make sure the **OAuth consent screen** is configured
2. If using external user type, add yourself as a **test user**
3. Check that **Google Calendar API** and/or **YouTube Data API v3** are enabled
4. Wait 10-15 minutes after making changes (Google sometimes takes time to propagate)

### For Spotify:
1. Make sure you clicked **Add** after entering each redirect URI (don't just type and save)
2. Check that your app is in **Development** mode (Production mode has stricter requirements)
3. Wait a few minutes after saving

### Quick Test:
Try opening the OAuth URL directly in browser to see the exact error:
- Spotify: The error page will show the redirect URI it received
- Google: The error page will show the redirect URI mismatch details

## Still Stuck?

1. Double-check the redirect URI in your OAuth app matches exactly
2. Make sure you saved the changes
3. Wait 5-10 minutes for propagation
4. Clear browser cookies/cache
5. Try in an incognito window


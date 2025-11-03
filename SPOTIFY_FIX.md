# Spotify "Redirect URI is not secure" Fix

## The Problem

Spotify shows: **"This redirect URI is not secure. Learn more here."** when trying to add `http://localhost:3000/api/auth/spotify/callback`

## Solutions (Try in order)

### Solution 1: Use `127.0.0.1` instead of `localhost`

1. Go to Spotify Developer Dashboard > Your App > Edit Settings
2. In Redirect URIs, add:
   ```
   http://127.0.0.1:3000/api/auth/spotify/callback
   ```
3. Click "Add" and then "Save"

**Why this works:** Spotify sometimes treats `127.0.0.1` differently than `localhost`

### Solution 2: Use a Different Port

Spotify allows certain ports for localhost. Try:
- Port 8080: `http://localhost:8080/api/auth/spotify/callback`
- Port 3001: `http://localhost:3001/api/auth/spotify/callback`
- Port 8888: `http://localhost:8888/api/auth/spotify/callback`

Then update your dev server to use that port:
```bash
# In package.json, change:
"dev": "next dev -p 8080"
```

### Solution 3: Ensure Development Mode

1. Go to Spotify Developer Dashboard
2. Check your app status - make sure it's in **Development** mode
3. Production mode has stricter HTTPS requirements

### Solution 4: Use HTTPS with ngrok (for testing)

If you need to test with HTTPS:
1. Install ngrok: `brew install ngrok` or download from ngrok.com
2. Start your dev server: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Use the ngrok HTTPS URL: `https://xxxx.ngrok.io/api/auth/spotify/callback`

### Recommended Fix

**Try this first:**
1. Use `http://127.0.0.1:3000/api/auth/spotify/callback` instead of `localhost`
2. Make sure your app is in Development mode
3. Ensure your dev server runs on port 3000:
   ```bash
   npm run dev -- -p 3000
   ```

This should work for most cases!


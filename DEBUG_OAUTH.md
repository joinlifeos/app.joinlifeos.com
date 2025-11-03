# Debugging OAuth Redirect URI Issues

If you've configured the redirect URIs correctly but it's still not working, try these steps:

## Quick Diagnostic Script

Open your browser console (F12) and run this to see what redirect URI is being used:

```javascript
// Check what redirect URI will be sent
console.log('Spotify redirect URI:', window.location.origin + '/api/auth/spotify/callback');
console.log('YouTube redirect URI:', window.location.origin + '/api/auth/youtube/callback');
console.log('Google redirect URI:', window.location.origin + '/api/auth/google/callback');
console.log('Current origin:', window.location.origin);
console.log('Current port:', window.location.port || 'default (3000)');
```

Copy the output and compare it EXACTLY to what's in your OAuth app settings.

## Step 1: Verify What Port Your App Is Running On

1. Start your dev server: `npm run dev`
2. Check the terminal output - it should show something like:
   ```
   ▲ Next.js 16.0.1
   - Local:        http://localhost:3000
   ```
3. **If it's NOT port 3000**, update your OAuth app redirect URIs to match the actual port!

## Step 2: Check the Actual Redirect URI Being Sent

Add this to your browser console when trying to connect:

### For Spotify:
1. Open browser DevTools (F12)
2. Go to Console tab
3. When clicking "Connect Spotify", you'll see the OAuth URL in the Network tab
4. Look for the `redirect_uri` parameter in the URL
5. It should be: `redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fspotify%2Fcallback`
   - Decoded: `http://localhost:3000/api/auth/spotify/callback`

### For Google/YouTube:
1. When clicking "Connect", check the OAuth URL
2. The `redirect_uri` parameter should match exactly

## Step 3: Verify Environment Variables Are Loaded

1. Check if your `.env.local` file exists in the project root
2. Make sure it has the correct values:
   ```bash
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_id_here
   SPOTIFY_CLIENT_SECRET=your_secret_here
   
   NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_id_here
   YOUTUBE_CLIENT_SECRET=your_secret_here
   # OR reuse Google Calendar:
   # NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_google_client_id_here
   # YOUTUBE_CLIENT_SECRET=your_google_client_secret_here
   ```
3. **Restart your dev server** after changing `.env.local`:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

## Step 4: Double-Check OAuth App Settings

### Google/YouTube:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Click your OAuth client
4. Verify the **Authorized redirect URIs** section shows:
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3000/api/auth/youtube/callback
   ```
5. Make sure there are NO:
   - Trailing slashes
   - Extra spaces
   - Different protocols (https vs http)
   - Different ports

### Spotify:
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app > Edit Settings
3. In **Redirect URIs**, verify each URI is on its own line:
   ```
   http://localhost:3000/api/auth/spotify/callback
   ```
4. Make sure each URI is separate (Spotify shows them as a list)
5. No trailing slashes, no extra spaces

## Step 5: Common Issues

### Issue: Using Wrong Port
**Symptom:** App runs on port 3001, 3002, etc.
**Fix:** Update OAuth app redirect URIs to match actual port, OR set Next.js to use port 3000:
```bash
# In package.json, update dev script:
"dev": "next dev -p 3000"
```

### Issue: Environment Variables Not Loading
**Symptom:** OAuth flow fails with "invalid client" or redirects don't work
**Fix:** 
1. Check `.env.local` is in project root (not in a subdirectory)
2. Restart dev server after changes
3. Variables with `NEXT_PUBLIC_` are client-accessible
4. Variables without `NEXT_PUBLIC_` are server-only

### Issue: Spotify "Add" Button Not Working
**Symptom:** Can't add redirect URIs in Spotify dashboard
**Fix:**
1. Make sure you're typing the full URI in the input field
2. Click "Add" button (don't just press Enter)
3. The URI should appear in the list below
4. Then click "Save" at the bottom

### Issue: Google Changes Not Propagating
**Symptom:** Changes saved but still getting errors
**Fix:**
1. Wait 10-15 minutes (Google can be slow)
2. Try clearing browser cache
3. Try in incognito window
4. Double-check the exact redirect URI in the error message

## Step 6: Get Exact Error Details

### For Spotify:
1. When you get the error, look at the full error URL
2. It might show: `redirect_uri=...` in the URL
3. Copy that redirect_uri value
4. Make sure it exactly matches what's in your Spotify app settings

### For Google/YouTube:
1. The error page usually shows the redirect URI it received
2. Compare it character-by-character with your OAuth app settings
3. Look for differences in:
   - Protocol (http vs https)
   - Port number
   - Path (`/api/auth/google/callback` vs `/api/auth/Google/callback`)
   - Trailing slashes

## Step 7: Test with Exact URI from Error

If the error shows a redirect URI, use that EXACT URI (even if it looks wrong):
1. Copy the exact redirect URI from the error
2. Decode it if it's URL-encoded
3. Add it to your OAuth app settings
4. Sometimes there's a mismatch in how it's being constructed

## Still Not Working?

Try this diagnostic:
1. What port is your app actually running on? (Check terminal output)
2. What exact redirect URI is in your OAuth app settings?
3. What exact redirect URI appears in the error message?
4. Are your environment variables loaded? (Check Network tab - is the OAuth URL being constructed?)
5. Have you restarted the dev server after changing `.env.local`?


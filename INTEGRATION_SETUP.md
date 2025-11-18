# Integration Setup Guide

This guide walks you through setting up all the service integrations for LifeCapture.

## Overview

LifeCapture supports the following integrations:

### Music Services
- **Spotify** - For adding songs to playlists (requires OAuth setup)
- **Apple Music** - For opening songs in Apple Music (no setup needed - uses URL schemes)
- **YouTube Music** - Currently not implemented (YouTube OAuth can be extended for this)

### Video Services
- **YouTube** - For adding videos to playlists (requires OAuth setup)

### Calendar Services
- **Google Calendar** - For adding events directly to your calendar (requires OAuth setup)

### Maps Services
- **Google Maps** - For saving restaurants to Google Maps (uses Google Calendar OAuth or API key)
- **Apple Maps** - For opening restaurants in Apple Maps (no setup needed - uses URL schemes)

### Bookmark Services
- **Raindrop** - For saving bookmarks and posts (requires OAuth setup)
- **Browser Bookmarks** - For exporting bookmarks as HTML file (no setup needed)

## Prerequisites

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. You'll need developer accounts for each service you want to use

---

## 1. YouTube, Google Calendar & Maps Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give it a name (e.g., "LifeCapture")

### Step 2: Enable APIs
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Enable the following APIs:
   - **Google Calendar API** (for Google Calendar integration)
   - **Gmail API** (for Gmail integration - required for pulling tasks from Gmail)
   - **YouTube Data API v3** (if using YouTube integration)
   - **Google Places API** (optional, for enhanced Google Maps integration)

### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for personal use) or Internal (for Google Workspace)
   - App name: LifeCapture
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" through the scopes section
   - Add test users if needed, then "Save and Continue"
4. For the OAuth client:
   - Application type: Web application
   - Name: LifeCapture Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs (click **Add URI** for each):
     - `http://localhost:3000/api/auth/google/callback` (for Google Calendar)
     - `http://localhost:3000/api/auth/youtube/callback` (for YouTube)
     - `http://localhost:3000/api/auth/gmail/callback` (for Gmail - **add this!**)
     - Your production callback URLs:
       - `https://yourdomain.com/api/auth/google/callback`
       - `https://yourdomain.com/api/auth/youtube/callback`
       - `https://yourdomain.com/api/auth/gmail/callback`
   - **Important:** Add ALL redirect URIs you'll use (Google Calendar, YouTube, and Gmail)
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

### Step 4: Add to `.env.local`
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Optional: For Google Maps Places API
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_api_key_here
```

**Note:** 
- Google Maps integration can reuse Google Calendar OAuth
- Optionally add a Places API key for better location search and place details
- Apple Maps works without any setup - it uses URL schemes to open locations

---

## 2. Apple Music (No Setup Required!)

Apple Music integration works automatically using URL schemes and web search URLs. No OAuth or API keys needed!

**How it works:**
- On iOS/macOS: Uses `music://` URL scheme to open Apple Music app
- Fallback: Opens Apple Music web search in browser
- No developer account or API setup required

---

## 3. Spotify Setup

### Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an app"
3. Fill in:
   - App name: LifeCapture
   - App description: Add songs from screenshots to Spotify playlists
   - Website (optional): Your website URL
   - Click "Save"
4. Go to "Settings" and in **Redirect URIs** section:
   - **IMPORTANT:** Spotify no longer allows `localhost` - you MUST use `127.0.0.1`!
   - Click "Add" button
   - Enter: `http://127.0.0.1:3000/api/auth/spotify/callback` (NOT localhost!)
   - Click "Add" button again for production URI:
   - Enter: `https://yourdomain.com/api/auth/spotify/callback` (must be https for production)
   - **Important:** 
     - You must click "Add" after entering each URI
     - Use `127.0.0.1` NOT `localhost` (Spotify security requirement)
     - No trailing slashes
   - Click "Save" at the bottom
   - **Note:** The code automatically converts `localhost` to `127.0.0.1` for Spotify, so you can access your app via either URL
5. Copy the **Client ID** and click "View client secret" to get the **Client Secret**

### Step 2: Add to `.env.local`
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

---

## 4. YouTube Setup

### Option 1: Reuse Google Calendar Credentials (Recommended)
Since YouTube uses the same Google Cloud project and OAuth system, you can reuse your Google Calendar credentials!

1. Go back to your Google Calendar OAuth client in Google Cloud Console
2. Edit the OAuth client (APIs & Services > Credentials > Your Google Calendar Client)
3. In **Authorized redirect URIs**, click **Add URI** and add:
   - `http://localhost:3000/api/auth/youtube/callback`
   - Click **Add URI** again and add:
   - `https://yourdomain.com/api/auth/youtube/callback` (for production)
4. **Important:** You should now have BOTH callback URLs in the list:
   - `http://localhost:3000/api/auth/google/callback`
   - `http://localhost:3000/api/auth/youtube/callback`
   - `https://yourdomain.com/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/youtube/callback`
5. Click **Save**
6. **Wait 5-10 minutes** for changes to propagate

### Step 2: Add to `.env.local`
If reusing Google Calendar credentials (recommended):
```bash
# Reuse the same values as Google Calendar
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_google_client_id_here
YOUTUBE_CLIENT_SECRET=your_google_client_secret_here
```

### Option 2: Create Separate YouTube OAuth Client (Optional)
If you prefer separate credentials:

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: Web application
4. Name: LifeCapture YouTube Client
5. Authorized JavaScript origins:
   - `http://localhost:3000`
   - Your production domain
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/youtube/callback`
   - `https://yourdomain.com/api/auth/youtube/callback`
7. Click "Create" and copy the **different** credentials

Then add to `.env.local`:
```bash
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_separate_youtube_client_id_here
YOUTUBE_CLIENT_SECRET=your_separate_youtube_client_secret_here
```

**Recommendation:** Use the same credentials (Option 1) - it's simpler and YouTube uses the same Google Cloud project anyway!

---

## 5. Google Maps Setup

Google Maps integration has two options:

### Option 1: Use Google Calendar Connection (Recommended)
- Google Maps will automatically use your Google Calendar OAuth connection
- No additional setup needed if you've already set up Google Calendar
- Allows opening locations in Google Maps

### Option 2: Add Google Places API Key (Optional)
For enhanced features like place search and detailed location information:

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Enable **Google Places API**
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"
5. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:3000/*` and your production domain
   - API restrictions: Restrict to "Google Places API"
6. Copy the API Key

### Apple Maps (No Setup Required!)

Apple Maps integration works automatically using URL schemes. No OAuth or API keys needed!

**How it works:**
- On iOS/macOS: Uses `maps://` URL scheme to open Apple Maps app
- Fallback: Opens Apple Maps web search in browser
- No developer account or API setup required

Add to `.env.local` (optional, only if using Places API):
```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_api_key_here
```

---

## 6. Raindrop Setup

### Step 1: Create Raindrop App
1. Go to [Raindrop Settings](https://app.raindrop.io/settings/integrations)
2. Scroll down to "Developers" section
3. Click "Create new app"
4. Fill in:
   - Name: LifeCapture
   - Redirect URI: `http://localhost:3000/api/auth/raindrop/callback`
   - Description: Save bookmarks from screenshots to Raindrop
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**
6. Add production redirect URI:
   - Go to your app settings
   - Add: `https://yourdomain.com/api/auth/raindrop/callback`
   - Save

### Step 2: Add to `.env.local`
```bash
NEXT_PUBLIC_RAINDROP_CLIENT_ID=your_raindrop_client_id_here
RAINDROP_CLIENT_SECRET=your_raindrop_client_secret_here
```

---

## 7. Complete `.env.local` File

Here's a complete example `.env.local` file with all integrations:

```bash
# AI Provider Keys (Required)
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key_here
# OR
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key_here

# Google Calendar & Maps (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_api_key_here  # Optional

# Spotify (Optional)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# YouTube (Optional - can reuse Google Calendar credentials)
# Option 1: Reuse Google Calendar (recommended)
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_google_client_id_here  # Same as Google Calendar
YOUTUBE_CLIENT_SECRET=your_google_client_secret_here      # Same as Google Calendar
# Option 2: Use separate YouTube credentials
# NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_separate_youtube_client_id_here
# YOUTUBE_CLIENT_SECRET=your_separate_youtube_client_secret_here

# Raindrop (Optional)
NEXT_PUBLIC_RAINDROP_CLIENT_ID=your_raindrop_client_id_here
RAINDROP_CLIENT_SECRET=your_raindrop_client_secret_here
```

---

## 8. Testing the Integrations

### Development
1. Start your dev server: `npm run dev`
2. Upload a screenshot and analyze it
3. Click "Connect" buttons in the settings modal for services you want to test
4. Complete OAuth flows when prompted

### Common Issues

**Issue: "Redirect URI mismatch"**
- Make sure the redirect URI in your OAuth app settings exactly matches the callback URL
- Check for trailing slashes, `http` vs `https`, etc.

**Issue: "Invalid client"**
- Verify your Client ID and Client Secret are correct in `.env.local`
- Make sure environment variables are prefixed correctly:
  - `NEXT_PUBLIC_*` for client-side accessible values
  - No prefix for server-only secrets

**Issue: "API not enabled"**
- Go to Google Cloud Console > APIs & Services > Library
- Make sure the required APIs are enabled for your project

**Issue: "Access denied"**
- Check that your OAuth consent screen is configured
- If using external user type, add yourself as a test user during development

---

## 9. Production Deployment

When deploying to production:

1. **Update OAuth Redirect URIs:**
   - Add your production domain to all OAuth app redirect URIs
   - Example: `https://yourdomain.com/api/auth/[service]/callback`

2. **Set Environment Variables:**
   - Add all environment variables to your hosting platform
   - Platform-specific guides:
     - **Vercel**: Project Settings > Environment Variables
     - **Netlify**: Site Settings > Environment Variables
     - **Railway/Render**: Environment Variables section

3. **Security Notes:**
   - Never commit `.env.local` to git (it should be in `.gitignore`)
   - Use different OAuth apps for production vs development (recommended)
   - Keep client secrets secure (server-side only)

---

## 10. Which Integrations Do I Need?

### For Events
- **Google Calendar** - Requires OAuth setup to add events directly
- **ICS Download** - Works without any setup (always available)

### For Songs
- **Spotify** - Requires OAuth setup - Adds songs to playlists
- **Apple Music** - No setup needed - Opens in Apple Music app/browser
- **YouTube Music** - Not currently implemented (would require separate OAuth setup)

### For Videos
- **YouTube** - Requires OAuth setup - Adds videos to playlists

### For Restaurants
- **Google Maps** - Uses Google Calendar OAuth or Places API key - Saves locations and opens in Google Maps
- **Apple Maps** - No setup needed - Opens in Apple Maps app

### For Links/Posts
- **Raindrop** - Requires OAuth setup - Saves to collections
- **Browser Bookmarks** - No setup needed - Exports HTML file

### No Setup Required

These integrations work out of the box using URL schemes or direct browser/app functionality:
- **Apple Music** - Uses `music://` URL scheme and web search URLs (`https://music.apple.com`)
- **Apple Maps** - Uses `maps://` URL scheme and web URLs (`https://maps.apple.com`)
- **Browser Bookmarks** - Direct file download functionality (Netscape bookmark format)

You only need to set up the integrations you plan to use. The app will work without any integrations - users can still download ICS files, export bookmarks, and open links in external apps.

---

## Quick Start Checklist

- [ ] Create `.env.local` file
- [ ] Add AI provider key (OpenAI or OpenRouter)
- [ ] Set up Google Calendar OAuth (for events + Google Maps)
- [ ] Set up Spotify OAuth (optional - for songs)
- [ ] Set up YouTube OAuth (optional - for videos, can reuse Google Calendar credentials)
- [ ] Set up Raindrop OAuth (optional - for links/posts)
- [ ] Add Google Places API key (optional - for enhanced Google Maps)
- [ ] Add all credentials to `.env.local`
- [ ] Test each integration locally
- [ ] Add production redirect URIs to all OAuth apps
- [ ] Deploy and set environment variables in hosting platform

**Note:** Apple Music and Apple Maps work automatically - no setup needed!

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are loaded (check network tab for API calls)
3. Ensure redirect URIs match exactly (see troubleshooting below)
4. Make sure APIs are enabled in respective developer consoles

### Redirect URI Errors

If you get errors like:
- Spotify: `INVALID_CLIENT: Invalid redirect URI`
- Google/YouTube: `Error 400: redirect_uri_mismatch`

**Quick Fix:**
1. The redirect URI in your OAuth app must **exactly match** the code
2. For localhost development, use `http://localhost:3000` (not `https`)
3. Make sure there are NO trailing slashes
4. In Spotify, you must click "Add" after entering each URI
5. Wait 5-10 minutes after making changes (they need to propagate)

**See `OAUTH_TROUBLESHOOTING.md` for detailed step-by-step fix.**
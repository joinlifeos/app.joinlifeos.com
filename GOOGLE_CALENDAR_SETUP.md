# Google Calendar API Setup

This guide will help you set up Google Calendar integration for LifeCapture.

## Prerequisites

1. A Google Cloud Platform account
2. Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "LifeCapture")
4. Click "Create"

### 2. Enable Google Calendar API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: LifeCapture
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `https://www.googleapis.com/auth/calendar.events`
   - Save and continue
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: LifeCapture Web Client
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Important:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is exposed to the client (safe)
- `GOOGLE_CLIENT_SECRET` is server-side only (keep it secret!)

### 5. Restart Your Development Server

After adding the environment variables, restart your Next.js dev server:

```bash
npm run dev
```

## How It Works

1. **User clicks "Connect Google Calendar"** → Redirects to Google OAuth
2. **User authorizes** → Google redirects back with authorization code
3. **Server exchanges code for token** → API route handles token exchange
4. **Token stored locally** → Browser stores access token securely
5. **Events created directly** → When user clicks "Add to Google Calendar", event is created via API

## Features

- ✅ Direct event creation in Google Calendar
- ✅ Automatic timezone handling
- ✅ Includes all event details (title, description, location, host)
- ✅ Secure token storage
- ✅ Token refresh on expiration
- ✅ Disconnect option

## Troubleshooting

### "Google Calendar integration not configured"
- Make sure `.env.local` exists with both variables
- Restart your dev server after adding variables

### "Redirect URI mismatch"
- Check that your redirect URI in Google Cloud Console matches exactly:
  - Development: `http://localhost:3000/api/auth/google/callback`
  - Production: `https://yourdomain.com/api/auth/google/callback`

### "Access denied" or "Consent screen not configured"
- Complete the OAuth consent screen setup in Google Cloud Console
- Make sure you've added the Calendar API scope

### Token expires
- The app automatically handles token expiration
- Users can reconnect if needed

## Production Deployment

When deploying to production:

1. Add the production redirect URI to Google Cloud Console
2. Set environment variables in your hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Other platforms: Check their documentation

3. Make sure `GOOGLE_CLIENT_SECRET` is marked as "Secret" and not exposed to the client

## Security Notes

- Never commit `.env.local` to version control
- Keep `GOOGLE_CLIENT_SECRET` secret (server-side only)
- Use HTTPS in production
- The access token is stored in browser localStorage (encrypted by the browser)


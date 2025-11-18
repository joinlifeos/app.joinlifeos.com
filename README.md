<div align="center">

# LifeCapture

Turn screenshots into actionable items instantly — events to calendar, songs to playlists, videos to YouTube, restaurants to maps, links to bookmarks, and more.

</div>

## Overview

LifeCapture is a Next.js app that classifies a screenshot (event, song, video, restaurant, link, social post), extracts structured data using OCR + AI, and offers one‑click actions:

- Add events to Google Calendar or download ICS
- Add songs to a Spotify playlist named "LifeCapture" or open in Apple Music
- Add videos to a YouTube playlist named "LifeCapture"
- Save restaurants to Google Maps (opens place/search URL)
- Save links/social posts to Raindrop or export a bookmark HTML

## Tech Stack

- Next.js App Router, TypeScript, Tailwind
- Zustand (client state)
- Tesseract.js (OCR)
- OpenAI/OpenRouter (vision models)
- Google Calendar, Spotify, YouTube, Raindrop, Google Maps/Places APIs

## Quick Start

1) Install deps and run dev server

```bash
npm install
npm run dev
```

Visit http://localhost:3000

On first launch you’ll see a modal to set your AI provider and API keys, and to connect integrations.

## Environment Variables

Create `.env.local` in the project root. Common variables:

```bash
# AI
NEXT_PUBLIC_OPENAI_API_KEY= # if using OpenAI directly (optional)
NEXT_PUBLIC_OPENROUTER_API_KEY= # if using OpenRouter (optional)

# Google
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=

# Spotify
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# YouTube
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=

# Raindrop
NEXT_PUBLIC_RAINDROP_CLIENT_ID=
RAINDROP_CLIENT_SECRET=
```

Notes:
- Google Maps works independently via `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.
- You can use either OpenAI or OpenRouter (or both) and choose in Settings.

## OAuth Setup

Refer to the step‑by‑step guides included in the repo:

- `GOOGLE_CALENDAR_SETUP.md`
- `INTEGRATION_SETUP.md` (Spotify, YouTube, etc.)
- `OAUTH_TROUBLESHOOTING.md` (common redirect URI issues)

Key callback routes (dev):

```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/youtube/callback
http://localhost:3000/api/auth/spotify/callback
http://localhost:3000/api/auth/raindrop/callback
```

Spotify localhost reminder: use `http://127.0.0.1:3000` if `localhost` is rejected.

## Development Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # start production server
npm run lint    # run eslint
```

## Project Structure (high‑level)

- `app/` — Next.js routes and UI shell (layout, page)
- `components/` — UI components (upload area, settings, forms, actions)
- `lib/` — API clients, OCR, extraction, classifiers, integrations
- `app/api/auth/*` — OAuth callback endpoints (Next.js route handlers)

## Security & Privacy

- OAuth tokens are stored in localStorage (client-only app). Revoke from provider dashboards if needed.
- Screenshots are processed locally for OCR; AI calls send extracted text and/or image to the configured provider.

## License

MIT

/**
 * YouTube API Integration
 *
 * This module handles YouTube OAuth and playlist operations.
 *
 * Setup required:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select existing one
 * 3. Enable YouTube Data API v3
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs: http://localhost:3000/api/auth/youtube/callback (dev)
 *    and your production domain (production)
 * 6. Set NEXT_PUBLIC_YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET environment variables
 */

const YOUTUBE_CLIENT_ID = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '';
const YOUTUBE_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/youtube/callback`
    : '';

const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';

export interface YouTubeAuth {
  accessToken: string;
  expiresAt: number;
}

/**
 * Get stored YouTube access token
 */
export function getYouTubeAuth(): YouTubeAuth | null {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('youtube_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.expiresAt > Date.now()) {
        return parsed;
      } else {
        clearYouTubeAuth();
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store YouTube access token
 */
export function storeYouTubeAuth(authData: YouTubeAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('youtube_auth', JSON.stringify(authData));
}

/**
 * Clear YouTube access token
 */
export function clearYouTubeAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('youtube_auth');
}

/**
 * Check if YouTube is authenticated and token is valid
 */
export function isYouTubeAuthenticated(): boolean {
  return !!getYouTubeAuth();
}

/**
 * Initiate YouTube OAuth flow
 */
export function initiateYouTubeAuth(): void {
  if (typeof window === 'undefined') return;
  if (!YOUTUBE_CLIENT_ID) {
    alert('YouTube Client ID is not configured. Please check your .env.local file.');
    return;
  }

  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('youtube_auth_state', state);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${YOUTUBE_CLIENT_ID}&redirect_uri=${encodeURIComponent(YOUTUBE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent&state=${state}`;
  window.location.href = authUrl;
}

/**
 * Search for a video on YouTube
 */
export async function searchYouTubeVideo(
  query: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string; channelTitle: string; thumbnail: string }>> {
  const auth = getYouTubeAuth();
  if (!auth) {
    throw new Error('YouTube not authenticated.');
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${limit}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearYouTubeAuth();
      throw new Error('Authentication expired. Please reconnect to YouTube.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to search YouTube: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.default?.url || '',
  }));
}

/**
 * Add video to YouTube playlist
 */
export async function addVideoToPlaylist(
  videoId: string,
  playlistId: string
): Promise<void> {
  const auth = getYouTubeAuth();
  if (!auth) {
    throw new Error('YouTube not authenticated.');
  }

  const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearYouTubeAuth();
      throw new Error('Authentication expired. Please reconnect to YouTube.');
    }
    const error = await response.json().catch(() => ({}));
    const reason = error?.error?.errors?.[0]?.reason || '';
    if (reason === 'channelNotFound' || /channel not found/i.test(error?.error?.message || '')) {
      throw new Error('Channel not found. Open YouTube while logged in once to initialize your channel, then try again.');
    }
    throw new Error(
      error.error?.message || `Failed to add video to playlist: ${response.statusText}`
    );
  }
}

/**
 * Create a new YouTube playlist
 */
export async function createYouTubePlaylist(
  title: string,
  description?: string,
  isPublic: boolean = false
): Promise<{ id: string }> {
  const auth = getYouTubeAuth();
  if (!auth) {
    throw new Error('YouTube not authenticated.');
  }

  const response = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        title,
        description: description || '',
      },
      status: {
        privacyStatus: isPublic ? 'public' : 'private',
      },
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearYouTubeAuth();
      throw new Error('Authentication expired. Please reconnect to YouTube.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to create playlist: ${response.statusText}`
    );
  }

  const playlist = await response.json();
  return {
    id: playlist.id,
  };
}

/**
 * Get user's YouTube playlists
 */
export async function getUserPlaylists(): Promise<
  Array<{ id: string; title: string }>
> {
  const auth = getYouTubeAuth();
  if (!auth) {
    throw new Error('YouTube not authenticated.');
  }

  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50',
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearYouTubeAuth();
      throw new Error('Authentication expired. Please reconnect to YouTube.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to get playlists: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.items.map((playlist: any) => ({
    id: playlist.id,
    title: playlist.snippet.title,
  }));
}


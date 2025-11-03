/**
 * Spotify API Integration
 *
 * This module handles Spotify OAuth and track/playlist operations.
 *
 * Setup required:
 * 1. Go to Spotify Developer Dashboard (https://developer.spotify.com/dashboard)
 * 2. Create a new app
 * 3. Add redirect URI: http://localhost:3000/api/auth/spotify/callback (dev)
 *    and your production domain (production)
 * 4. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables
 */

const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin.replace('localhost', '127.0.0.1')}/api/auth/spotify/callback`
    : '';

const SCOPES = 'playlist-modify-public playlist-modify-private user-read-private';

export interface SpotifyAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Get stored Spotify access token
 */
export function getSpotifyAuth(): SpotifyAuth | null {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('spotify_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.expiresAt > Date.now()) {
        return parsed;
      } else {
        // Token expired, try to refresh
        clearSpotifyAuth();
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store Spotify access token
 */
export function storeSpotifyAuth(authData: SpotifyAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('spotify_auth', JSON.stringify(authData));
}

/**
 * Clear Spotify access token
 */
export function clearSpotifyAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('spotify_auth');
}

/**
 * Check if Spotify is authenticated and token is valid
 */
export function isSpotifyAuthenticated(): boolean {
  return !!getSpotifyAuth();
}

/**
 * Initiate Spotify OAuth flow
 */
export function initiateSpotifyAuth(): void {
  if (typeof window === 'undefined') return;
  if (!SPOTIFY_CLIENT_ID) {
    alert('Spotify Client ID is not configured. Please check your .env.local file.');
    return;
  }

  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('spotify_auth_state', state);

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
  window.location.href = authUrl;
}

/**
 * Search for a track on Spotify
 */
export async function searchSpotifyTrack(
  query: string,
  limit: number = 5
): Promise<Array<{ id: string; name: string; artist: string; album: string; uri: string }>> {
  const auth = getSpotifyAuth();
  if (!auth) {
    throw new Error('Spotify not authenticated.');
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
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
      clearSpotifyAuth();
      throw new Error('Authentication expired. Please reconnect to Spotify.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to search Spotify: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    uri: track.uri,
  }));
}

/**
 * Add track to Spotify playlist
 */
export async function addTrackToPlaylist(
  trackUri: string,
  playlistId: string
): Promise<void> {
  const auth = getSpotifyAuth();
  if (!auth) {
    throw new Error('Spotify not authenticated.');
  }

  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [trackUri],
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSpotifyAuth();
      throw new Error('Authentication expired. Please reconnect to Spotify.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to add track to playlist: ${response.statusText}`
    );
  }
}

/**
 * Create a new Spotify playlist
 */
export async function createSpotifyPlaylist(
  name: string,
  description?: string,
  isPublic: boolean = false
): Promise<{ id: string; uri: string }> {
  const auth = getSpotifyAuth();
  if (!auth) {
    throw new Error('Spotify not authenticated.');
  }

  // Get user ID first
  const userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to get user information');
  }

  const user = await userResponse.json();
  const userId = user.id;

  // Create playlist
  const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description: description || '',
      public: isPublic,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSpotifyAuth();
      throw new Error('Authentication expired. Please reconnect to Spotify.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to create playlist: ${response.statusText}`
    );
  }

  const playlist = await response.json();
  return {
    id: playlist.id,
    uri: playlist.uri,
  };
}

/**
 * Get user's Spotify playlists
 */
export async function getUserPlaylists(): Promise<
  Array<{ id: string; name: string; uri: string }>
> {
  const auth = getSpotifyAuth();
  if (!auth) {
    throw new Error('Spotify not authenticated.');
  }

  const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSpotifyAuth();
      throw new Error('Authentication expired. Please reconnect to Spotify.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to get playlists: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.items.map((playlist: any) => ({
    id: playlist.id,
    name: playlist.name,
    uri: playlist.uri,
  }));
}


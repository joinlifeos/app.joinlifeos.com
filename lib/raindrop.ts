/**
 * Raindrop API Integration
 *
 * This module handles Raindrop OAuth and bookmark operations.
 *
 * Setup required:
 * 1. Go to Raindrop API Settings (https://app.raindrop.io/settings/integrations)
 * 2. Create a new application
 * 3. Add redirect URI: http://localhost:3000/api/auth/raindrop/callback (dev)
 *    and your production domain (production)
 * 4. Set NEXT_PUBLIC_RAINDROP_CLIENT_ID and RAINDROP_CLIENT_SECRET environment variables
 */

const RAINDROP_CLIENT_ID = process.env.NEXT_PUBLIC_RAINDROP_CLIENT_ID || '';
const RAINDROP_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/raindrop/callback`
    : '';

export interface RaindropAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Get stored Raindrop access token
 */
export function getRaindropAuth(): RaindropAuth | null {
  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('raindrop_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.expiresAt > Date.now()) {
        return parsed;
      } else {
        clearRaindropAuth();
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store Raindrop access token
 */
export function storeRaindropAuth(authData: RaindropAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('raindrop_auth', JSON.stringify(authData));
}

/**
 * Clear Raindrop access token
 */
export function clearRaindropAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('raindrop_auth');
}

/**
 * Check if Raindrop is authenticated and token is valid
 */
export function isRaindropAuthenticated(): boolean {
  return !!getRaindropAuth();
}

/**
 * Initiate Raindrop OAuth flow
 */
export function initiateRaindropAuth(): void {
  if (typeof window === 'undefined') return;
  if (!RAINDROP_CLIENT_ID) {
    alert('Raindrop Client ID is not configured. Please check your .env.local file.');
    return;
  }

  const state = Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('raindrop_auth_state', state);

  const authUrl = `https://raindrop.io/oauth/authorize?client_id=${RAINDROP_CLIENT_ID}&redirect_uri=${encodeURIComponent(RAINDROP_REDIRECT_URI)}&response_type=code&state=${state}`;
  window.location.href = authUrl;
}

/**
 * Create a bookmark in Raindrop
 */
export async function createRaindropBookmark(
  title: string,
  url: string,
  description?: string,
  collectionId?: number
): Promise<{ id: number; url: string }> {
  const auth = getRaindropAuth();
  if (!auth) {
    throw new Error('Raindrop not authenticated.');
  }

  const response = await fetch('https://api.raindrop.io/rest/v1/raindrop', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      link: url,
      excerpt: description || '',
      collectionId: collectionId || 0, // 0 = Unsorted
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearRaindropAuth();
      throw new Error('Authentication expired. Please reconnect to Raindrop.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.errorMessage || error.message || `Failed to create bookmark: ${response.statusText}`
    );
  }

  const bookmark = await response.json();
  return {
    id: bookmark.item._id,
    url: bookmark.item.link,
  };
}

/**
 * Create a new Raindrop collection
 */
export async function createRaindropCollection(
  title: string,
  isPublic: boolean = false
): Promise<{ id: number; title: string }> {
  const auth = getRaindropAuth();
  if (!auth) {
    throw new Error('Raindrop not authenticated.');
  }

  const response = await fetch('https://api.raindrop.io/rest/v1/collection', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      public: isPublic,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearRaindropAuth();
      throw new Error('Authentication expired. Please reconnect to Raindrop.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.errorMessage || error.message || `Failed to create collection: ${response.statusText}`
    );
  }

  const collection = await response.json();
  return {
    id: collection.item._id,
    title: collection.item.title,
  };
}

/**
 * Get user's Raindrop collections
 */
export async function getUserCollections(): Promise<
  Array<{ id: number; title: string }>
> {
  const auth = getRaindropAuth();
  if (!auth) {
    throw new Error('Raindrop not authenticated.');
  }

  const response = await fetch('https://api.raindrop.io/rest/v1/collections', {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearRaindropAuth();
      throw new Error('Authentication expired. Please reconnect to Raindrop.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.errorMessage || error.message || `Failed to get collections: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.items.map((collection: any) => ({
    id: collection._id,
    title: collection.title,
  }));
}


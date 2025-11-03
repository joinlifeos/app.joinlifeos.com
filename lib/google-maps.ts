/**
 * Google Maps Integration
 *
 * This module handles Google Maps/Places API operations.
 * Uses the existing Google Calendar OAuth flow if possible, or API key.
 */

import { getStoredAuth as getGoogleCalendarAuth, storeAuth, clearAuth } from './google-calendar';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const GOOGLE_MAPS_DISABLED_KEY = 'google_maps_disabled';

export interface GoogleMapsAuth {
  accessToken: string;
  expiresAt: number;
}

/**
 * Get Google Maps auth (reuse Google Calendar auth if available)
 */
export function getGoogleMapsAuth(): GoogleMapsAuth | null {
  // Reuse Google Calendar auth if available
  const calendarAuth = getGoogleCalendarAuth();
  if (calendarAuth) {
    return {
      accessToken: calendarAuth.accessToken,
      expiresAt: calendarAuth.expiresAt,
    };
  }

  if (typeof window === 'undefined') return null;
  const authData = localStorage.getItem('google_maps_auth');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      if (parsed.expiresAt > Date.now()) {
        return parsed;
      } else {
        clearGoogleMapsAuth();
        return null;
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Store Google Maps auth
 */
export function storeGoogleMapsAuth(authData: GoogleMapsAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('google_maps_auth', JSON.stringify(authData));
}

/**
 * Clear Google Maps auth
 */
export function clearGoogleMapsAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('google_maps_auth');
  // mark disabled so UI can reflect disconnected even if API key exists
  try {
    localStorage.setItem(GOOGLE_MAPS_DISABLED_KEY, '1');
  } catch {}
}

export function enableGoogleMaps(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOOGLE_MAPS_DISABLED_KEY);
  } catch {}
}

/**
 * Check if Google Maps is authenticated
 */
export function isGoogleMapsAuthenticated(): boolean {
  // If user explicitly disabled Maps, treat as not connected
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem(GOOGLE_MAPS_DISABLED_KEY) === '1') return false;
    } catch {}
  }
  // Consider configured if we have a Places API key OR a Maps-specific auth
  // Calendar auth is optional (backwards-compatible), not required
  return !!GOOGLE_PLACES_API_KEY || !!getGoogleMapsAuth() || !!getGoogleCalendarAuth();
}

/**
 * Save a place to Google Maps "Saved" list
 */
export async function savePlaceToGoogleMaps(
  name: string,
  address: string,
  coordinates?: { latitude: number; longitude: number }
): Promise<{ placeId: string; url: string }> {
  const auth = getGoogleMapsAuth();
  
  // First, search for the place
  let placeId: string | undefined;
  
  if (GOOGLE_PLACES_API_KEY) {
    // Use Places API with OAuth
    const query = `${name} ${address}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_PLACES_API_KEY}`;
    
    try {
      const searchResponse = await fetch(searchUrl);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.candidates && searchData.candidates.length > 0) {
          placeId = searchData.candidates[0].place_id;
        }
      }
    } catch (error) {
      console.warn('Failed to search Google Places:', error);
    }
  }

  if (!placeId && coordinates) {
    // Fallback: generate URL with coordinates
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
    return {
      placeId: '',
      url: mapsUrl,
    };
  }

  if (!placeId) {
    // Fallback: generate search URL
    const query = encodeURIComponent(`${name} ${address}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    return {
      placeId: '',
      url: mapsUrl,
    };
  }

  // For now, return a Google Maps URL - full "Saved" list API requires more setup
  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  return {
    placeId: placeId,
    url: mapsUrl,
  };
}

/**
 * Open location in Google Maps
 */
export function openInGoogleMaps(
  name: string,
  address: string,
  coordinates?: { latitude: number; longitude: number }
): void {
  if (typeof window === 'undefined') return;

  let mapsUrl: string;
  
  if (coordinates) {
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
  } else {
    const query = encodeURIComponent(`${name} ${address}`);
    mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  window.open(mapsUrl, '_blank');
}


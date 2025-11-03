/**
 * Google Calendar API Integration
 * 
 * This module handles Google Calendar OAuth and event creation.
 * 
 * Setup required:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com/)
 * 2. Create a new project or select existing one
 * 3. Enable Google Calendar API
 * 4. Create OAuth 2.0 credentials (Web application)
 * 5. Add authorized redirect URIs: http://localhost:3000/api/auth/google/callback (dev)
 *    and your production domain (production)
 * 6. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/google/callback`
    : '';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export interface GoogleCalendarAuth {
  accessToken: string;
  expiresAt: number;
}

/**
 * Get stored Google Calendar access token
 */
export function getStoredAuth(): GoogleCalendarAuth | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('google_calendar_auth');
  if (!stored) return null;

  try {
    const auth: GoogleCalendarAuth = JSON.parse(stored);
    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= auth.expiresAt - 5 * 60 * 1000) {
      localStorage.removeItem('google_calendar_auth');
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

/**
 * Store Google Calendar access token
 */
export function storeAuth(auth: GoogleCalendarAuth): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('google_calendar_auth', JSON.stringify(auth));
}

/**
 * Clear stored Google Calendar auth
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('google_calendar_auth');
}

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleAuth(): void {
  if (!GOOGLE_CLIENT_ID) {
    alert(
      'Google Calendar integration is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.'
    );
    return;
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Check if user is authenticated with Google Calendar
 */
export function isGoogleCalendarAuthenticated(): boolean {
  return getStoredAuth() !== null;
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  eventData: {
    title: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: string;
    attendees?: Array<{ email: string }>;
  }
): Promise<{ id: string; htmlLink: string }> {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('Not authenticated with Google Calendar');
  }

  // Google Calendar API uses "summary" for the event title
  const googleEventData = {
    summary: eventData.title,
    description: eventData.description,
    start: eventData.start,
    end: eventData.end,
    location: eventData.location,
    attendees: eventData.attendees,
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEventData),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error('Authentication expired. Please reconnect to Google Calendar.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Failed to create calendar event: ${response.statusText}`
    );
  }

  const result = await response.json();
  return {
    id: result.id,
    htmlLink: result.htmlLink,
  };
}

/**
 * Format event data for Google Calendar
 */
export function formatEventForGoogleCalendar(event: {
  title: string;
  date: string;
  time: string;
  endDate?: string;
  endTime?: string;
  location?: string;
  description?: string;
  host?: string;
}): {
  title: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
} {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const startDateTime = new Date(`${event.date}T${event.time}`);
  const endDateTime = event.endTime
    ? new Date(`${event.endDate || event.date}T${event.endTime}`)
    : new Date(startDateTime.getTime() + 3600000); // Default 1 hour

  let description = event.description || '';
  if (event.host) {
    description = `${description ? `${description}\n\n` : ''}Host: ${event.host}`;
  }

  return {
    title: event.title,
    description: description.trim() || undefined,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: userTimeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: userTimeZone,
    },
    location: event.location || undefined,
  };
}


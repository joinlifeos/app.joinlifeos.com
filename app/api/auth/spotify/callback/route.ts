import { NextRequest, NextResponse } from 'next/server';

/**
 * Spotify OAuth Callback Handler
 *
 * This API route handles the OAuth callback from Spotify and exchanges
 * the authorization code for an access token.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(`Spotify authentication failed: ${error}`)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('No authorization code received')}`, request.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  // Spotify requires 127.0.0.1 instead of localhost
  const redirectUri = `${request.nextUrl.origin.replace('localhost', '127.0.0.1')}/api/auth/spotify/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent('Spotify integration not configured')}`,
        request.url
      )
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json().catch(() => ({}));
      throw new Error(error.error_description || 'Failed to exchange token');
    }

    const tokens = await tokenResponse.json();

    // Calculate expiration time (with 5 minute buffer)
    const expiresAt = Date.now() + (tokens.expires_in - 300) * 1000;

    // Store token in session storage and redirect back
    const authData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    };

    // Redirect to main page with token in hash (client-side handles it)
    return NextResponse.redirect(
      new URL(
        `/?spotify_auth=${encodeURIComponent(JSON.stringify(authData))}`,
        request.url
      )
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}


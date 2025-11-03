import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Callback Handler
 * 
 * This API route handles the OAuth callback from Google and exchanges
 * the authorization code for an access token.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('No authorization code received')}`, request.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent('Google Calendar integration not configured')}`,
        request.url
      )
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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
    // We'll pass the token via URL fragment (client-side will handle)
    const authData = {
      accessToken: tokens.access_token,
      expiresAt,
    };

    // Redirect to main page with token in hash (client-side handles it)
    return NextResponse.redirect(
      new URL(
        `/?google_auth=${encodeURIComponent(JSON.stringify(authData))}`,
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


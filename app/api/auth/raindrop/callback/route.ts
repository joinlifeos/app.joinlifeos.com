import { NextRequest, NextResponse } from 'next/server';

/**
 * Raindrop OAuth Callback Handler
 *
 * This API route handles the OAuth callback from Raindrop and exchanges
 * the authorization code for an access token.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(`Raindrop authentication failed: ${error}`)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent('No authorization code received')}`, request.url)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_RAINDROP_CLIENT_ID;
  const clientSecret = process.env.RAINDROP_CLIENT_SECRET;
  const redirectUri = `${request.nextUrl.origin}/api/auth/raindrop/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent('Raindrop integration not configured')}`,
        request.url
      )
    );
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://raindrop.io/oauth/access_token', {
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
      throw new Error(error.error_description || error.error || 'Failed to exchange token');
    }

    const tokens = await tokenResponse.json();

    // Calculate expiration time (with 5 minute buffer)
    // Raindrop tokens typically don't expire, but we'll set a long expiration
    const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year

    // Store token in session storage and redirect back
    const authData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
    };

    // Redirect to main page with token in hash (client-side handles it)
    return NextResponse.redirect(
      new URL(
        `/?raindrop_auth=${encodeURIComponent(JSON.stringify(authData))}`,
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


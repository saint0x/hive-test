import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const GOOGLE_CLIENT_ID = '1027395944679-049n69bno5mi3127jco9vj1l4ingv34s.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
const GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=missing_code');
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokenData = await tokenResponse.json();

    // Here you would typically set a cookie or store the token in some way
    // For this example, we'll just redirect to the home page with the token
    return NextResponse.redirect(`/?token=${tokenData.access_token}`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect('/login?error=auth_failed');
  }
}
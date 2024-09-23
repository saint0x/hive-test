import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    console.error('No code provided in the callback');
    return NextResponse.redirect(new URL('/login?error=missing_code', FRONTEND_URL));
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(errorData.error || 'Failed to exchange code for token');
    }

    const data = await response.json();

    // Create a new response object
    const redirectResponse = NextResponse.redirect(new URL('/', FRONTEND_URL));

    // Set the access token as an HTTP-only cookie
    redirectResponse.cookies.set('google_access_token', data.oauthToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return redirectResponse;
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', FRONTEND_URL));
  }
}
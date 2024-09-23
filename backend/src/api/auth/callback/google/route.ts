import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=missing_code');
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/google/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Google');
    }

    const data = await response.json();

    // Here you would typically set a cookie or store the token in some way
    // For this example, we'll just redirect to the home page
    return NextResponse.redirect('/');
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect('/login?error=auth_failed');
  }
}
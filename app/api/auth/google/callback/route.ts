import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '@/utils/googleAuth';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${FRONTEND_URL}/api/auth/google/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=missing_code');
  }

  try {
    console.log('Exchanging code for tokens...');
    const tokens = await getTokenFromCode(code);
    console.log('Tokens received:', tokens);
    
    // Store the tokens in a secure HTTP-only cookie
    const response = NextResponse.redirect('/?auth=success');
    response.cookies.set('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect('/login?error=auth_failed');
  }
}
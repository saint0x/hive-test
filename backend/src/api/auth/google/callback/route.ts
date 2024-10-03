import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCode } from '../../../../utils/googleAuth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/login?error=missing_code');
  }

  try {
    const tokens = await getTokenFromCode(code);
    
    // Store the tokens in a secure HTTP-only cookie
    const response = NextResponse.redirect('/dashboard');
    response.cookies.set('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 * 24 * 7 // 1 week
    });

    return response;
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect('/login?error=auth_failed');
  }
}
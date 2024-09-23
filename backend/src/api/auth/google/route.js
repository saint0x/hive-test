const { NextResponse } = require('next/server');
const { getGoogleTokens, getUserInfo } = require('../lib/google-auth');

async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/error?message=No code provided');
  }

  try {
    const tokens = await getGoogleTokens(code);
    const userInfo = await getUserInfo(tokens.access_token);

    // Here you would typically store the user info and tokens in your database
    // For this example, we'll just set them in cookies
    const response = NextResponse.redirect('/dashboard');
    
    response.cookies.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    response.cookies.set('user_info', JSON.stringify(userInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    return response;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return NextResponse.redirect('/error?message=Failed to authenticate with Google');
  }
}

module.exports = { GET };
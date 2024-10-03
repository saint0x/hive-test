const { Hono } = require('hono');
const { google } = require('googleapis');
const { setCookie, getCookie } = require('hono/cookie');

const authRouter = new Hono();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

authRouter.get('/check', async (c) => {
  const accessToken = getCookie(c, 'google_access_token');
  if (!accessToken) {
    return c.json({ isAuthenticated: false });
  }

  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    return c.json({ 
      isAuthenticated: true, 
      user: userInfo.data,
      oauthToken: accessToken
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return c.json({ isAuthenticated: false });
  }
});

authRouter.get('/google/url', async (c) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
    return c.json({ url: authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return c.json({ error: 'Failed to generate auth URL' }, 500);
  }
});

authRouter.post('/google/token', async (c) => {
  const { code } = await c.req.json();
  if (!code) {
    return c.json({ error: 'Missing authorization code' }, 400);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    setCookie(c, 'google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: tokens.expires_in
    });

    return c.json({ 
      success: true, 
      user: userInfo.data,
      oauthToken: tokens.access_token
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return c.json({ error: 'Failed to authenticate with Google' }, 500);
  }
});

authRouter.post('/logout', async (c) => {
  setCookie(c, 'google_access_token', '', {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 0
  });
  return c.json({ success: true });
});

module.exports = authRouter;
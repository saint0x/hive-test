import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// ... other imports and setup

app.post('/api/auth/google/token', async (c) => {
  const { code } = await c.req.json();
  
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const userinfo = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    // Here, implement your user creation/login logic
    // ...

    return c.json({ success: true, user: userinfo.data });
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return c.json({ error: 'Authentication failed' }, 400);
  }
});
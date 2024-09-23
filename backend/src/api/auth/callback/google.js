module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    try {
      // Exchange the code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
          client_secret: 'GOCSPX-abcdefghijklmnopqrstuvwxyz',
          redirect_uri: 'http://localhost:3000/api/auth/callback/google',
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to exchange code for tokens');
      }

      // Here you would typically:
      // 1. Verify the ID token
      // 2. Get user info from Google
      // 3. Create or update user in your database
      // 4. Generate a session token or JWT for your app

      // For this example, we'll just return the access token
      // In a real app, never send this to the client!
      res.status(200).json({ token: tokenData.access_token });
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
  'GOCSPX-abcdefghijklmnopqrstuvwxyz',
  'http://localhost:3000/api/auth/callback/google'
);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.body;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.status(200).json(tokens);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).json({ message: 'Failed to exchange code for tokens' });
  }
};
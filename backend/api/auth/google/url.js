const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  '1027395944679-049n69bno5mi3127jco9vj1l4ingv34s.apps.googleusercontent.com',
  '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',
  'http://localhost:3000/api/auth/callback/google'
);

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/presentations',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
      });
      res.status(200).json({ url: authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ error: 'Failed to generate auth URL' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
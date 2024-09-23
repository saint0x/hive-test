const { getAuthUrl } = require('../../../utils/googleAuth');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const authUrl = getAuthUrl();
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
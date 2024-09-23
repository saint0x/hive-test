const { Hono } = require('hono');
const { google } = require('googleapis');
const { getCookie } = require('hono/cookie');

const sheetsRouter = new Hono();

// Authentication middleware
async function authenticate(c, next) {
  const accessToken = getCookie(c, 'google_access_token');
  if (!accessToken) {
    return c.json({ error: 'Not authenticated' }, 401);
  }
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  c.set('auth', auth);
  await next();
}

sheetsRouter.use('*', authenticate);

sheetsRouter.get('/spreadsheets', async (c) => {
  const auth = c.get('auth');
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, mimeType, thumbnailLink)',
    });
    return c.json(response.data.files);
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    return c.json({ error: 'Failed to fetch spreadsheets' }, 500);
  }
});

sheetsRouter.get('/spreadsheets/:id', async (c) => {
  const auth = c.get('auth');
  const spreadsheetId = c.req.param('id');
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
      fields: 'properties.title,sheets.properties',
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error fetching spreadsheet details:', error);
    return c.json({ error: 'Failed to fetch spreadsheet details' }, 500);
  }
});

sheetsRouter.get('/spreadsheets/:id/values', async (c) => {
  const auth = c.get('auth');
  const spreadsheetId = c.req.param('id');
  const range = c.req.query('range');
  if (!range) {
    return c.json({ error: 'Range parameter is required' }, 400);
  }
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    return c.json(response.data);
  } catch (error) {
    console.error('Error fetching spreadsheet values:', error);
    return c.json({ error: 'Failed to fetch spreadsheet values' }, 500);
  }
});

module.exports = sheetsRouter;
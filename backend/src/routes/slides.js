const { Hono } = require('hono');
const { google } = require('googleapis');
const { getCookie } = require('hono/cookie');

const slidesRouter = new Hono();

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

slidesRouter.use('*', authenticate);

slidesRouter.get('/presentations', async (c) => {
  const auth = c.get('auth');
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.presentation'",
      fields: 'files(id, name, mimeType, thumbnailLink)',
    });
    return c.json(response.data.files);
  } catch (error) {
    console.error('Error fetching presentations:', error);
    return c.json({ error: 'Failed to fetch presentations', details: error.message }, 500);
  }
});

slidesRouter.get('/presentations/:id', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  try {
    const data = await getPresentationData(auth, id);
    return c.json(data);
  } catch (error) {
    console.error(`Error fetching presentation ${id}:`, error);
    return c.json({ error: 'Failed to fetch presentation', details: error.message }, 500);
  }
});

slidesRouter.get('/api/slides/presentations', async (c) => {
  const auth = c.get('auth');
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.presentation'",
      fields: 'files(id, name, mimeType, thumbnailLink)',
    });
    return c.json(response.data.files);
  } catch (error) {
    console.error('Error fetching presentations:', error);
    return c.json({ error: 'Failed to fetch presentations', details: error.message }, 500);
  }
});

module.exports = slidesRouter;
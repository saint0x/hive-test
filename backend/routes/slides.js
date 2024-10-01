const { Hono } = require('hono');
const { google } = require('googleapis');

const slidesRouter = new Hono();

// Authentication middleware
async function authenticate(c, next) {
  const auth = c.get('auth');
  if (!auth) {
    return c.json({ error: 'Not authenticated' }, 401);
  }
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
    const slides = google.slides({ version: 'v1', auth });
    const response = await slides.presentations.get({ 
      presentationId: id,
      fields: 'presentationId,title,slides,pageSize,masters'
    });
    return c.json(response.data);
  } catch (error) {
    console.error(`Error fetching metadata for presentation ${id}:`, error);
    return c.json({ error: 'Failed to fetch presentation metadata', details: error.message }, 500);
  }
});

slidesRouter.get('/presentations/:id/export', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  try {
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.export({
      fileId: id,
      mimeType: 'application/pdf',
    }, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="presentation-${id}.pdf"`);
    return c.body(pdfBuffer);
  } catch (error) {
    console.error(`Error exporting presentation ${id}:`, error);
    return c.json({ error: 'Failed to export presentation', details: error.message }, 500);
  }
});

slidesRouter.post('/presentations/:id/update', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  const { updates } = await c.req.json();

  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return c.json({ error: 'Invalid updates provided' }, 400);
  }

  try {
    const slides = google.slides({ version: 'v1', auth });
    const requests = updates.map(update => ({
      insertText: {
        objectId: update.elementId,
        insertionIndex: 0,
        text: update.content
      }
    }));

    await slides.presentations.batchUpdate({
      presentationId: id,
      requestBody: { requests }
    });
    return c.json({ message: 'Presentation updated successfully' });
  } catch (error) {
    console.error(`Error updating presentation ${id}:`, error);
    return c.json({ error: 'Failed to update presentation', details: error.message }, 500);
  }
});

slidesRouter.post('/presentations/:id/create-placeholder', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  const { pageId, x, y, width, height } = await c.req.json();

  if (!pageId || typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    return c.json({ error: 'Invalid parameters provided' }, 400);
  }

  try {
    const slides = google.slides({ version: 'v1', auth });
    const response = await slides.presentations.batchUpdate({
      presentationId: id,
      requestBody: {
        requests: [{
          createShape: {
            objectId: `placeholder_${Date.now()}`,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageId,
              size: {
                width: { magnitude: width, unit: 'PT' },
                height: { magnitude: height, unit: 'PT' }
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: x,
                translateY: y,
                unit: 'PT'
              }
            }
          }
        }]
      }
    });
    const placeholderId = response.data.replies[0].createShape.objectId;
    return c.json({ placeholderId });
  } catch (error) {
    console.error(`Error creating placeholder in presentation ${id}:`, error);
    if (error.response && error.response.data && error.response.data.error) {
      return c.json({ 
        error: 'Failed to create placeholder', 
        details: error.response.data.error.message,
        code: error.response.data.error.code
      }, error.response.status);
    }
    return c.json({ error: 'Failed to create placeholder', details: error.message }, 500);
  }
});

slidesRouter.get('/presentations/:id/slides/:pageId', async (c) => {
  const auth = c.get('auth');
  const { id, pageId } = c.req.param();
  try {
    const slides = google.slides({ version: 'v1', auth });
    const response = await slides.presentations.pages.get({
      presentationId: id,
      pageObjectId: pageId,
    });
    return c.json(response.data);
  } catch (error) {
    console.error(`Error fetching slide content for presentation ${id}, page ${pageId}:`, error);
    return c.json({ error: 'Failed to fetch slide content', details: error.message }, 500);
  }
});

slidesRouter.post('/presentations/:id/generate-batch', async (c) => {
  const auth = c.get('auth');
  const { id } = c.req.param();
  const { sheetId, sheetRange, count } = await c.req.json();

  if (!sheetId || !sheetRange || !count) {
    return c.json({ error: 'Missing required parameters' }, 400);
  }

  try {
    const newConnections = await generateBatchSlides(auth, id, sheetId, sheetRange, count);
    return c.json({ message: 'Batch slides generated successfully', connections: newConnections });
  } catch (error) {
    console.error(`Error generating batch slides for presentation ${id}:`, error);
    return c.json({ error: 'Failed to generate batch slides', details: error.message }, 500);
  }
});

module.exports = slidesRouter;
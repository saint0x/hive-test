const { Hono } = require('hono');
const connectionsApi = require('../api/connections');

const connectionsRouter = new Hono();

connectionsRouter.post('/connections', async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json();

  try {
    const connection = await connectionsApi.createConnection(
      auth,
      body.sheetId,
      body.slideId,
      body.sheetRange,
      body.slidePageId,
      body.x,
      body.y,
      body.width,
      body.height,
      body.isImage
    );
    return c.json(connection, 201);
  } catch (error) {
    console.error('Error creating connection:', error);
    return c.json({ error: 'Failed to create connection' }, 500);
  }
});

connectionsRouter.get('/connections', (c) => {
  return c.json(connectionsApi.getConnections());
});

connectionsRouter.post('/connections/sync', async (c) => {
  const auth = c.get('auth');
  try {
    await connectionsApi.syncAllConnections(auth);
    return c.json({ message: 'All connections synced successfully' });
  } catch (error) {
    console.error('Error syncing connections:', error);
    return c.json({ error: 'Failed to sync connections' }, 500);
  }
});

module.exports = connectionsRouter;
const express = require('express');
const router = express.Router();
const connectionsApi = require('../api/connections');
const { google } = require('googleapis');
const { validateConnection, validate } = require('../middleware/validation');

// Middleware to set up auth for each request
const authMiddleware = async (req, res, next) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: req.headers.authorization.split(' ')[1] });
  req.auth = auth;
  next();
};

router.use(authMiddleware);

// Create a new connection
router.post('/', validateConnection, validate, async (req, res) => {
  try {
    const { sheetId, slideId, sheetRange, slidePageId, x, y, width, height } = req.body;
    const connection = await connectionsApi.createConnection(
      req.auth,
      sheetId,
      slideId,
      sheetRange,
      slidePageId,
      x,
      y,
      width,
      height
    );
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all connections
router.get('/', async (req, res) => {
  try {
    const connections = await connectionsApi.getConnections(req.auth);
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a connection
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedConnection = await connectionsApi.updateConnection(req.auth, id, updates);
    res.json(updatedConnection);
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a connection
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await connectionsApi.deleteConnection(req.auth, id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reorder connections
router.post('/reorder', async (req, res) => {
  try {
    const { connectionIds } = req.body;
    const reorderedConnections = await connectionsApi.reorderConnections(req.auth, connectionIds);
    res.json(reorderedConnections);
  } catch (error) {
    console.error('Error reordering connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync all connections
router.post('/sync', async (req, res) => {
  try {
    await connectionsApi.syncAllConnections(req.auth);
    res.json({ message: 'All connections synced successfully' });
  } catch (error) {
    console.error('Error syncing connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate batch slides
router.post('/generate-batch', async (req, res) => {
  try {
    const { sheetId, slideId, sheetRange, count } = req.body;
    const newConnections = await connectionsApi.generateBatchSlides(req.auth, slideId, sheetId, sheetRange, count);
    res.json(newConnections);
  } catch (error) {
    console.error('Error generating batch slides:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
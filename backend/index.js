const { serve } = require('@hono/node-server');
const { Hono } = require('hono');
const { logger } = require('hono/logger');
const { prettyJSON } = require('hono/pretty-json');
const { google } = require('googleapis');
const authRouter = require('./routes/auth');
const sheetsRouter = require('./routes/sheets');
const slidesRouter = require('./routes/slides');
const connectionsRouter = require('./routes/connections');

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());

// Custom CORS middleware
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  if (origin) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  if (c.req.method === 'OPTIONS') {
    return c.text('', 200);
  }

  await next();
});

// Authentication middleware
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.split(' ')[1];
    if (accessToken) {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      c.set('auth', oauth2Client);
    }
  }
  await next();
});

// Mount routers
app.route('/api/auth', authRouter);
app.route('/api', sheetsRouter);
app.route('/api', slidesRouter);
app.route('/api', connectionsRouter);

// Health check route
app.get('/health', (c) => c.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Catch-all route for debugging
app.all('*', (c) => {
  console.log('Received request:', c.req.method, c.req.path);
  return c.text('Route not found', 404);
});

// Not found handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

const port = process.env.PORT || 3001;
const server = serve({
  fetch: app.fetch,
  port: port
});

server.on('listening', () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
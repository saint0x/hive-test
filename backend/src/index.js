require('dotenv').config({ path: '.env.local' });
const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const { cors } = require('hono/cors');
const sheetsRouter = require('./routes/sheets');
const slidesRouter = require('./routes/slides');
const authRouter = require('./routes/auth');
const connectionsRouter = require('./routes/connections');
const express = require('express');
const userRoutes = require('./routes/user');

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
}));

// Add logging middleware
app.use('*', async (c, next) => {
  console.log('Request headers:', c.req.headers);
  await next();
  console.log('Response headers:', c.res.headers);
});

// Main API endpoint
app.get('/', (c) => c.json({ message: '🚀 Backend is live!' }));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount routers
app.route('/api/auth', authRouter);
app.route('/api', sheetsRouter);
app.route('/api', slidesRouter);
app.route('/api/connections', connectionsRouter);
app.use('/api/user', userRoutes);

const port = process.env.PORT || 3001;

// Start the server
const server = serve({
  fetch: app.fetch,
  port: port
});

server.on('listening', () => {
  console.log(`🚀 Backend server is running on http://localhost:${port}`);
  console.log('Try visiting http://localhost:3001 in your browser to see the "Backend is live" message');
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Export the app for testing purposes
module.exports = app;
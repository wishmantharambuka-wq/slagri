// routes/sseRoutes.js  —  /api/events endpoint
const router = require('express').Router();
const { addClient } = require('../services/sse');

/**
 * GET /api/events
 * Any page subscribes to this to receive live push events.
 * No auth required — events contain only non-sensitive change notifications.
 */
router.get('/', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');  // disable Nginx buffering
  res.flushHeaders();

  // Send an initial "connected" event
  res.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);

  addClient(res);
});

module.exports = router;

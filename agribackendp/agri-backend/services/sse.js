// services/sse.js  —  Server-Sent Events broadcaster
// =====================================================
// A simple in-process pub/sub. Controllers import `emit()`
// to push events; the SSE route keeps client connections alive.
//
// Events:
//   submission.created  — a new crop submission was posted
//   submission.updated  — admin verified/rejected a submission
//   listing.created     — a new marketplace listing was posted
//   alert.created       — a new system alert was generated
//   kpi.updated         — any change that would affect the admin KPI cards

const clients = new Set();

/**
 * Register a new SSE client response stream.
 * Called once per client connection.
 */
function addClient(res) {
  clients.add(res);
  console.info(`[SSE] Client connected — total: ${clients.size}`);
  res.on('close', () => {
    clients.delete(res);
    console.info(`[SSE] Client disconnected — total: ${clients.size}`);
  });
}

/**
 * Push a named event + JSON payload to all connected clients.
 * @param {string} event  — e.g. "submission.created"
 * @param {object} data   — serialisable payload
 */
function emit(event, data) {
  if (clients.size === 0) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(message); } catch { clients.delete(res); }
  }
  console.info(`[SSE] Broadcast "${event}" to ${clients.size} client(s)`);
}

// Heartbeat every 25 s to keep connections alive through proxies
setInterval(() => {
  const ping = `: heartbeat ${new Date().toISOString()}\n\n`;
  for (const res of clients) {
    try { res.write(ping); } catch { clients.delete(res); }
  }
}, 25_000);

module.exports = { addClient, emit };

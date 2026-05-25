import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

const PORT = Number(process.env.PORT ?? 3001);
const PING_INTERVAL_MS = 25_000;

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`[runtime] WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const clientId = Math.random().toString(36).slice(2, 8);
  console.log(`[runtime] client connected: ${clientId} (${req.socket.remoteAddress ?? 'unknown'})`);

  const pingTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }, PING_INTERVAL_MS);

  ws.on('message', (data) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ error: 'invalid JSON' }));
      return;
    }

    // Phase 0: echo server. Real match routing goes here in Phase 2+.
    ws.send(JSON.stringify({ echo: parsed, clientId }));
  });

  ws.on('pong', () => {
    // keepalive acknowledged
  });

  ws.on('close', () => {
    clearInterval(pingTimer);
    console.log(`[runtime] client disconnected: ${clientId}`);
  });

  ws.on('error', (err) => {
    console.error(`[runtime] client error (${clientId}):`, err.message);
  });

  ws.send(JSON.stringify({ type: 'connected', clientId }));
});

wss.on('error', (err) => {
  console.error('[runtime] server error:', err);
  process.exit(1);
});

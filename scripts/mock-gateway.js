const http = require('http');
const WebSocket = require('ws');

const port = Number.parseInt(process.env.MOCK_GATEWAY_PORT || '18789', 10);
const host = process.env.MOCK_GATEWAY_HOST || '127.0.0.1';

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    let frame;
    try {
      frame = JSON.parse(String(data));
    } catch (err) {
      return;
    }
    if (frame.type !== 'req') return;
    const id = frame.id || `res-${Date.now()}`;
    if (frame.method === 'connect') {
      socket.send(
        JSON.stringify({
          type: 'res',
          id,
          ok: true,
          payload: { protocol: 3 }
        })
      );
      return;
    }
    if (frame.method === 'chat.send') {
      socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: {} }));
      socket.send(
        JSON.stringify({
          type: 'event',
          event: 'chat',
          payload: {
            state: 'final',
            runId: `run-${Date.now()}`,
            message: {
              content: [{ text: `mock-reply: ${frame.params?.message || ''}` }]
            }
          }
        })
      );
      return;
    }
    socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: {} }));
  });
});

server.listen(port, host, () => {
  console.log(`mock-gateway listening on ${host}:${port}`);
});

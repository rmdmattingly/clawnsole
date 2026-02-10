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
  
    if (frame.method === 'cron.status') {
      socket.send(
        JSON.stringify({
          type: 'res',
          id,
          ok: true,
          payload: { enabled: true, storePath: '/tmp/cron/jobs.json', jobs: 2, nextWakeAtMs: Date.now() + 60_000 }
        })
      );
      return;
    }

    if (frame.method === 'cron.list') {
      const now = Date.now();
      socket.send(
        JSON.stringify({
          type: 'res',
          id,
          ok: true,
          payload: {
            jobs: [
              {
                id: 'job-1',
                agentId: 'main',
                name: 'Nightly report',
                enabled: true,
                createdAtMs: now - 10_000,
                updatedAtMs: now - 10_000,
                schedule: { kind: 'cron', expr: '0 2 * * *', tz: 'UTC' },
                sessionTarget: 'isolated',
                wakeMode: 'next-heartbeat',
                payload: { kind: 'agentTurn', message: 'do thing' },
                state: { nextRunAtMs: now + 5 * 60_000, lastRunAtMs: now - 60 * 60_000, lastStatus: 'ok', lastDurationMs: 1200 }
              },
              {
                id: 'job-2',
                agentId: 'dev',
                name: 'PR sweep',
                enabled: false,
                createdAtMs: now - 20_000,
                updatedAtMs: now - 20_000,
                schedule: { kind: 'every', everyMs: 900_000 },
                sessionTarget: 'isolated',
                wakeMode: 'next-heartbeat',
                payload: { kind: 'agentTurn', message: 'run worker' },
                state: { nextRunAtMs: now + 2 * 60_000, lastRunAtMs: now - 2 * 60 * 60_000, lastStatus: 'error', lastError: 'mock failure', lastDurationMs: 500 }
              }
            ]
          }
        })
      );
      return;
    }

    if (frame.method === 'cron.runs') {
      const now = Date.now();
      socket.send(
        JSON.stringify({
          type: 'res',
          id,
          ok: true,
          payload: {
            entries: [
              { ts: now - 60_000, jobId: String(frame.params?.id || frame.params?.jobId || 'job-1'), action: 'finished', status: 'ok', durationMs: 1234, summary: 'mock run ok' },
              { ts: now - 2 * 60 * 60_000, jobId: String(frame.params?.id || frame.params?.jobId || 'job-1'), action: 'finished', status: 'error', durationMs: 200, error: 'mock error' }
            ]
          }
        })
      );
      return;
    }

    if (frame.method === 'cron.run') {
      socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: { ok: true } }));
      return;
    }
    socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: {} }));
      const sessionKey = typeof frame.params?.sessionKey === 'string' ? frame.params.sessionKey : '';
      socket.send(
        JSON.stringify({
          type: 'event',
          event: 'chat',
          payload: {
            state: 'final',
            runId: `run-${Date.now()}`,
            sessionKey,
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

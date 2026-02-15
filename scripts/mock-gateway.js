const http = require('http');
const WebSocket = require('ws');

const port = Number.parseInt(process.env.MOCK_GATEWAY_PORT || '18789', 10);
const host = process.env.MOCK_GATEWAY_HOST || '127.0.0.1';

function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  return url
    .slice(idx + 1)
    .split('&')
    .filter(Boolean)
    .reduce((acc, pair) => {
      const [k, v] = pair.split('=');
      if (!k) return acc;
      acc[decodeURIComponent(k)] = decodeURIComponent(v || '');
      return acc;
    }, {});
}

const server = http.createServer((req, res) => {
  const url = String(req.url || '/');

  // Test-only endpoints so Playwright can simulate gateway disconnect/auth-expiry.
  // Example: /__test__/close?code=4401&reason=unauthorized
  if (url.startsWith('/__test__/close')) {
    const q = parseQuery(url);
    const codeRaw = Number.parseInt(q.code || '1001', 10);
    const code = Number.isFinite(codeRaw) ? codeRaw : 1001;
    const reason = q.reason || 'test-close';

    for (const client of wss.clients) {
      try {
        client.close(code, reason);
      } catch {}
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, code, reason, clients: wss.clients.size }));
    return;
  }

  res.writeHead(200);
  res.end('ok');
});

const wss = new WebSocket.Server({ server });

// sessionKey -> { runId, timer }
const activeRuns = new Map();

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
      const sessionKey = typeof frame.params?.sessionKey === 'string' ? frame.params.sessionKey : '';
      const runId = `run-${Date.now()}`;

      // Emit a delta immediately, then delay the final so UI has time to press Stop.
      socket.send(
        JSON.stringify({
          type: 'event',
          event: 'chat',
          payload: {
            state: 'delta',
            runId,
            sessionKey,
            message: { content: [{ text: `mock-stream: ${String(frame.params?.message || '').slice(0, 16)}` }] }
          }
        })
      );

      const existing = activeRuns.get(sessionKey);
      if (existing?.timer) clearTimeout(existing.timer);

      const timer = setTimeout(() => {
        activeRuns.delete(sessionKey);
        socket.send(
          JSON.stringify({
            type: 'event',
            event: 'chat',
            payload: {
              state: 'final',
              runId,
              sessionKey,
              message: {
                content: [{ text: `mock-reply: ${frame.params?.message || ''}` }]
              }
            }
          })
        );
      }, 3000);

      activeRuns.set(sessionKey, { runId, timer });
      return;
    }



    if (frame.method === 'chat.abort') {
      socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: {} }));
      const sessionKey = typeof frame.params?.sessionKey === 'string' ? frame.params.sessionKey : '';
      const runId = typeof frame.params?.runId === 'string' ? frame.params.runId : activeRuns.get(sessionKey)?.runId;
      const entry = activeRuns.get(sessionKey);
      if (entry?.timer) clearTimeout(entry.timer);
      activeRuns.delete(sessionKey);

      socket.send(
        JSON.stringify({
          type: 'event',
          event: 'chat',
          payload: {
            state: 'error',
            runId: runId || `run-${Date.now()}`,
            sessionKey,
            errorMessage: 'Canceled'
          }
        })
      );
      return;
    }
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
    socket.send(JSON.stringify({ type: 'res', id, ok: true, payload: {} }));
  });
});

server.listen(port, host, () => {
  console.log(`mock-gateway listening on ${host}:${port}`);
});
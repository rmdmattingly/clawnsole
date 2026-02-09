const DEFAULT_GUEST_METHODS = new Set([
  'connect',
  'chat.send',
  'chat.history',
  'chat.abort',
  'sessions.resolve',
  'sessions.reset'
]);

function isLocalhostHost(hostname) {
  const host = String(hostname || '').trim().toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function assertSecureWsUrl(wsUrl, { allowInsecure = false } = {}) {
  const raw = String(wsUrl || '').trim();
  if (!raw) return;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    // If it’s not a valid URL, leave validation to downstream.
    return;
  }

  if (parsed.protocol === 'wss:') return;
  if (parsed.protocol !== 'ws:') return;
  if (allowInsecure) return;
  if (isLocalhostHost(parsed.hostname)) return;

  const e = new Error(
    `Refusing insecure WebSocket upstream (ws://) for non-localhost host: ${parsed.host}. ` +
      `Use wss:// (TLS) or set CLAWNSOLE_ALLOW_INSECURE_TRANSPORT=1 for dev-only use.`
  );
  e.code = 'INSECURE_TRANSPORT';
  throw e;
}

function safeClose(socket, code, reason) {
  if (!socket) return;
  try {
    if (typeof code === 'number') {
      socket.close(code, reason ? String(reason) : '');
      return;
    }
    socket.close();
  } catch {}
}

function resolveWsOrigin(wsUrl) {
  try {
    const parsed = new URL(wsUrl);
    const scheme = parsed.protocol === 'wss:' ? 'https' : 'http';
    return `${scheme}://${parsed.host}`;
  } catch {
    return 'http://127.0.0.1';
  }
}

function createProxyHandlers({
  WebSocket,
  getRoleFromCookies,
  readToken,
  gatewayWsUrl,
  guestAllowedMethods = DEFAULT_GUEST_METHODS,
  heartbeatMs = 2000,
  getGuestPrompt,
  getGuestAgentId,
  onGuestSessionKey
}) {
  function handleAdminProxy(clientSocket, req) {
    const role = getRoleFromCookies(req);
    if (role !== 'admin') {
      safeClose(clientSocket, 4401, 'unauthorized');
      return;
    }

    const { token } = readToken();
    const upstreamUrl = gatewayWsUrl();
    assertSecureWsUrl(upstreamUrl, { allowInsecure: process.env.CLAWNSOLE_ALLOW_INSECURE_TRANSPORT === '1' });
    const upstream = new WebSocket(upstreamUrl, { headers: { Origin: resolveWsOrigin(upstreamUrl) } });
    const pendingFrames = [];
    const adminState = {
      sessionKey: null
    };
    let lastUpstreamAt = Date.now();
    let recentCount = 0;
    let closed = false;
    const heartbeat = setInterval(() => {
      const idleForMs = Date.now() - lastUpstreamAt;
      const payload = {
        type: 'event',
        event: 'activity',
        payload: {
          ts: Date.now(),
          idleForMs,
          recentCount
        }
      };
      recentCount = 0;
      try {
        clientSocket.send(JSON.stringify(payload));
      } catch {}
    }, heartbeatMs);

    function normalizeAndSend(frame) {
      if (!frame || frame.type !== 'req') return;
      if (frame.method === 'chat.send' || frame.method === 'chat.history' || frame.method === 'chat.abort' || frame.method === 'chat.inject') {
        const key = frame.params?.sessionKey;
        if (typeof key === 'string' && key) adminState.sessionKey = key;
      }
      if (frame.method === 'sessions.resolve' || frame.method === 'sessions.reset') {
        const key = frame.params?.key;
        if (typeof key === 'string' && key) adminState.sessionKey = key;
      }
      if (frame.method === 'connect') {
        const instanceId = frame.params?.client?.instanceId;
        const clientId = frame.params?.client?.id;
        const suffix = instanceId || clientId || 'admin';
        adminState.sessionKey = `agent:main:admin:${suffix}`;
        frame.params = frame.params || {};
        frame.params.auth = { token };
        frame.params.scopes = frame.params.scopes || ['operator.read', 'operator.write'];
        frame.params.role = frame.params.role || 'operator';
      }
      try {
        upstream.send(JSON.stringify(frame));
      } catch {}
    }

    clientSocket.on('message', (data) => {
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        return;
      }
      if (frame?.type !== 'req') return;
      if (upstream.readyState !== 1) {
        pendingFrames.push(frame);
        return;
      }
      normalizeAndSend(frame);
    });

    upstream.on('open', () => {
      while (pendingFrames.length > 0) {
        normalizeAndSend(pendingFrames.shift());
      }
    });

    upstream.on('message', (data) => {
      lastUpstreamAt = Date.now();
      recentCount += 1;
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        clientSocket.send(String(data));
        return;
      }

      if (frame?.type === 'event' && frame.event === 'chat') {
        const sessionKey = frame.payload?.sessionKey;
        if (!sessionKey) {
          return;
        }
        if (adminState.sessionKey && sessionKey !== adminState.sessionKey) {
          return;
        }
      }

      clientSocket.send(JSON.stringify(frame));
    });

    const closeBoth = (code, reason) => {
      if (closed) return;
      closed = true;
      safeClose(upstream, code, reason);
      safeClose(clientSocket, code, reason);
      clearInterval(heartbeat);
    };

    clientSocket.on('close', closeBoth);
    upstream.on('close', (code, reasonBuf) => closeBoth(code, reasonBuf ? reasonBuf.toString() : ''));
    upstream.on('error', (err) => {
      const message = err && err.code ? `${err.code} ${err.message || 'upstream error'}` : String(err || 'upstream error');
      closeBoth(1013, message.slice(0, 180));
    });
  }

  function handleGuestProxy(clientSocket, req) {
    const role = getRoleFromCookies(req);
    if (role !== 'guest') {
      safeClose(clientSocket, 4401, 'unauthorized');
      return;
    }

    const { token } = readToken();
    const guestAgentId = typeof getGuestAgentId === 'function' ? getGuestAgentId() : 'main';
    const upstreamUrl = gatewayWsUrl();
    assertSecureWsUrl(upstreamUrl, { allowInsecure: process.env.CLAWNSOLE_ALLOW_INSECURE_TRANSPORT === '1' });
    const upstream = new WebSocket(upstreamUrl, { headers: { Origin: resolveWsOrigin(upstreamUrl) } });
    const pendingFrames = [];
    const guestState = {
      sessionKey: null,
      connectId: null,
      injected: false
    };
    let lastUpstreamAt = Date.now();
    let recentCount = 0;
    let closed = false;
    const heartbeat = setInterval(() => {
      const idleForMs = Date.now() - lastUpstreamAt;
      const payload = {
        type: 'event',
        event: 'activity',
        payload: {
          ts: Date.now(),
          idleForMs,
          recentCount
        }
      };
      recentCount = 0;
      try {
        clientSocket.send(JSON.stringify(payload));
      } catch {}
    }, heartbeatMs);

    function normalizeAndSend(frame) {
      if (!frame || frame.type !== 'req') return;
      if (frame.method === 'connect') {
        const instanceId = frame.params?.client?.instanceId;
        const clientId = frame.params?.client?.id;
        const suffix = instanceId || clientId || 'guest';
        guestState.sessionKey = `agent:${guestAgentId || 'main'}:guest:${suffix}`;
        guestState.connectId = frame.id;
        if (typeof onGuestSessionKey === 'function') {
          onGuestSessionKey(guestState.sessionKey);
        }
        frame.params = frame.params || {};
        frame.params.auth = { token };
        frame.params.scopes = ['operator.read', 'operator.write'];
        frame.params.role = 'operator';
      }
      if (frame.method === 'chat.send' || frame.method === 'chat.history' || frame.method === 'chat.abort') {
        frame.params = frame.params || {};
        frame.params.sessionKey = guestState.sessionKey || frame.params.sessionKey;
      }
      if (frame.method === 'sessions.resolve' || frame.method === 'sessions.reset') {
        frame.params = frame.params || {};
        frame.params.key = guestState.sessionKey || frame.params.key;
      }
      try {
        upstream.send(JSON.stringify(frame));
      } catch {}
    }

    clientSocket.on('message', (data) => {
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        return;
      }
      if (frame?.type !== 'req') return;
      if (!guestAllowedMethods.has(frame.method)) {
        clientSocket.send(
          JSON.stringify({
            type: 'res',
            id: frame.id || 'unknown',
            ok: false,
            error: { code: 'FORBIDDEN', message: 'guest role not allowed for this method' }
          })
        );
        return;
      }

      if (upstream.readyState !== 1) {
        pendingFrames.push(frame);
        return;
      }
      normalizeAndSend(frame);
    });

    upstream.on('open', () => {
      while (pendingFrames.length > 0) {
        normalizeAndSend(pendingFrames.shift());
      }
    });

    upstream.on('message', (data) => {
      let frame;
      try {
        frame = JSON.parse(String(data));
      } catch {
        return;
      }
      lastUpstreamAt = Date.now();
      recentCount += 1;
      if (frame?.type === 'res' && frame.id === guestState.connectId && frame.ok && !guestState.injected) {
        guestState.injected = true;
        const guestPrompt =
          typeof getGuestPrompt === 'function'
            ? getGuestPrompt()
            : 'Guest mode: read-only. Do not access or summarize emails or private data. Do not assume identity; ask how you can help.';
        if (guestPrompt) {
          upstream.send(
            JSON.stringify({
              type: 'req',
              id: `guest-reset-${Date.now()}`,
              method: 'sessions.reset',
              params: {
                key: guestState.sessionKey || 'agent:main:guest:default'
              }
            })
          );
          upstream.send(
            JSON.stringify({
              type: 'req',
              id: `guest-prompt-${Date.now()}`,
              method: 'chat.inject',
              params: {
                sessionKey: guestState.sessionKey || 'agent:main:guest:default',
                message: guestPrompt,
                label: 'Guest profile'
              }
            })
          );
        }
      }
      if (frame?.type === 'event') {
        const eventName = String(frame.event || '');
        const allowed = eventName === 'chat' || eventName.startsWith('connect.');
        if (!allowed) {
          return;
        }

        if (eventName === 'chat') {
          const sessionKey = frame.payload?.sessionKey;
          if (!sessionKey) {
            return;
          }
          if (guestState.sessionKey && sessionKey !== guestState.sessionKey) {
            return;
          }
        }
      }
      clientSocket.send(JSON.stringify(frame));
    });

    const closeBoth = (code, reason) => {
      if (closed) return;
      closed = true;
      safeClose(upstream, code, reason);
      safeClose(clientSocket, code, reason);
      clearInterval(heartbeat);
    };

    clientSocket.on('close', closeBoth);
    upstream.on('close', (code, reasonBuf) => closeBoth(code, reasonBuf ? reasonBuf.toString() : ''));
    upstream.on('error', (err) => {
      const message = err && err.code ? `${err.code} ${err.message || 'upstream error'}` : String(err || 'upstream error');
      closeBoth(1013, message.slice(0, 180));
    });
  }

  return { handleAdminProxy, handleGuestProxy };
}

module.exports = {
  DEFAULT_GUEST_METHODS,
  createProxyHandlers
};

const DEFAULT_GUEST_METHODS = new Set([
  'connect',
  'chat.send',
  'chat.history',
  'chat.abort',
  'sessions.resolve',
  'sessions.reset'
]);

function createProxyHandlers({
  WebSocket,
  getRoleFromCookies,
  readToken,
  gatewayWsUrl,
  guestAllowedMethods = DEFAULT_GUEST_METHODS,
  heartbeatMs = 2000,
  getGuestPrompt,
  getGuestAgentId
}) {
  function handleAdminProxy(clientSocket, req) {
    const role = getRoleFromCookies(req);
    if (role !== 'admin') {
      clientSocket.close();
      return;
    }

    const { token } = readToken();
    const upstream = new WebSocket(gatewayWsUrl());
    let lastUpstreamAt = Date.now();
    let recentCount = 0;
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

    upstream.on('open', () => {
      clientSocket.on('message', (data) => {
        let frame;
        try {
          frame = JSON.parse(String(data));
        } catch {
          return;
        }
        if (frame?.type !== 'req') return;
        if (frame.method === 'connect') {
          frame.params = frame.params || {};
          frame.params.auth = { token };
          frame.params.scopes = frame.params.scopes || ['operator.read', 'operator.write'];
          frame.params.role = frame.params.role || 'operator';
        }
        upstream.send(JSON.stringify(frame));
      });
    });

    upstream.on('message', (data) => {
      lastUpstreamAt = Date.now();
      recentCount += 1;
      clientSocket.send(String(data));
    });

    const closeBoth = () => {
      try {
        upstream.close();
      } catch {}
      try {
        clientSocket.close();
      } catch {}
      clearInterval(heartbeat);
    };

    clientSocket.on('close', closeBoth);
    upstream.on('close', closeBoth);
    upstream.on('error', closeBoth);
  }

  function handleGuestProxy(clientSocket, req) {
    const role = getRoleFromCookies(req);
    if (role !== 'guest') {
      clientSocket.close();
      return;
    }

    const { token } = readToken();
    const guestAgentId = typeof getGuestAgentId === 'function' ? getGuestAgentId() : 'main';
    const upstream = new WebSocket(gatewayWsUrl());
    const guestState = {
      sessionKey: null,
      connectId: null,
      injected: false
    };
    let lastUpstreamAt = Date.now();
    let recentCount = 0;
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

    upstream.on('open', () => {
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
        if (frame.method === 'connect') {
          const instanceId = frame.params?.client?.instanceId;
          const clientId = frame.params?.client?.id;
          const suffix = instanceId || clientId || 'guest';
          guestState.sessionKey = `agent:${guestAgentId || 'main'}:guest:${suffix}`;
          guestState.connectId = frame.id;
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
        upstream.send(JSON.stringify(frame));
      });
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
      }
      clientSocket.send(JSON.stringify(frame));
    });

    const closeBoth = () => {
      try {
        upstream.close();
      } catch {}
      try {
        clientSocket.close();
      } catch {}
      clearInterval(heartbeat);
    };

    clientSocket.on('close', closeBoth);
    upstream.on('close', closeBoth);
    upstream.on('error', closeBoth);
  }

  return { handleAdminProxy, handleGuestProxy };
}

module.exports = {
  DEFAULT_GUEST_METHODS,
  createProxyHandlers
};

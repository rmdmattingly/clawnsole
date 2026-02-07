/* global WebSocket, navigator */

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
    return;
  }
  const existing = root.Clawnsole || {};
  root.Clawnsole = { ...existing, ...api };
})(typeof self !== 'undefined' ? self : globalThis, function () {
  function fallbackUuid() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
  }

  function randomId() {
    // Prefer Web Crypto, but don’t require secure-context APIs.
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch {}
    return fallbackUuid();
  }

  function defaultIsOnline() {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
        return navigator.onLine;
      }
    } catch {}
    return true;
  }

  class GatewayClient {
    constructor(options = {}) {
      this.WebSocketImpl = options.WebSocketImpl || (typeof WebSocket !== 'undefined' ? WebSocket : null);
      this.timers = options.timers || {
        setTimeout: (fn, ms) => setTimeout(fn, ms),
        clearTimeout: (id) => clearTimeout(id),
        setInterval: (fn, ms) => setInterval(fn, ms),
        clearInterval: (id) => clearInterval(id)
      };

      this.prepare = typeof options.prepare === 'function' ? options.prepare : async () => {};
      this.getUrl = typeof options.getUrl === 'function' ? options.getUrl : () => '';
      this.buildConnectParams =
        typeof options.buildConnectParams === 'function' ? options.buildConnectParams : () => ({});
      this.keepAlive = typeof options.keepAlive === 'function' ? options.keepAlive : null;

      this.onStatus = typeof options.onStatus === 'function' ? options.onStatus : () => {};
      this.onFrame = typeof options.onFrame === 'function' ? options.onFrame : () => {};
      this.onConnected = typeof options.onConnected === 'function' ? options.onConnected : () => {};
      this.onDisconnected = typeof options.onDisconnected === 'function' ? options.onDisconnected : () => {};
      this.isAuthed = typeof options.isAuthed === 'function' ? options.isAuthed : () => true;
      this.checkAuth = typeof options.checkAuth === 'function' ? options.checkAuth : null;
      this.onAuthExpired = typeof options.onAuthExpired === 'function' ? options.onAuthExpired : () => {};
      this.isOnline = typeof options.isOnline === 'function' ? options.isOnline : defaultIsOnline;

      this.challengeWaitMs = Number.isFinite(options.challengeWaitMs) ? options.challengeWaitMs : 800;
      this.handshakeTimeoutMs = Number.isFinite(options.handshakeTimeoutMs) ? options.handshakeTimeoutMs : 12000;
      this.requestTimeoutMs = Number.isFinite(options.requestTimeoutMs) ? options.requestTimeoutMs : 15000;
      this.keepAliveMs = Number.isFinite(options.keepAliveMs) ? options.keepAliveMs : 25000;

      this.reconnectBaseMs = Number.isFinite(options.reconnectBaseMs) ? options.reconnectBaseMs : 600;
      this.reconnectFactor = Number.isFinite(options.reconnectFactor) ? options.reconnectFactor : 1.7;
      this.reconnectJitter = Number.isFinite(options.reconnectJitter) ? options.reconnectJitter : 0.25;
      this.maxReconnectMs = Number.isFinite(options.maxReconnectMs) ? options.maxReconnectMs : 30000;
      this.maxReconnectAttempts = Number.isFinite(options.maxReconnectAttempts) ? options.maxReconnectAttempts : 12;

      this.socket = null;
      this.pending = new Map();
      this.connected = false;
      this.challenge = null;
      this.handshakeSent = false;
      this.manualDisconnect = false;

      this.connectTimer = null;
      this.handshakeTimeoutTimer = null;
      this.keepAliveTimer = null;
      this.reconnectTimer = null;
      this.reconnectAttempt = 0;
    }

    clearHandshakeTimers() {
      if (this.connectTimer) {
        this.timers.clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }
      if (this.handshakeTimeoutTimer) {
        this.timers.clearTimeout(this.handshakeTimeoutTimer);
        this.handshakeTimeoutTimer = null;
      }
    }

    clearReconnectTimer() {
      if (this.reconnectTimer) {
        this.timers.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }

    stopKeepAlive() {
      if (this.keepAliveTimer) {
        this.timers.clearInterval(this.keepAliveTimer);
        this.keepAliveTimer = null;
      }
    }

    flushPending(message) {
      for (const [id, resolver] of this.pending.entries()) {
        try {
          resolver({ type: 'res', id, ok: false, error: { message } });
        } catch {}
      }
      this.pending.clear();
    }

    closeSocket({ silent = false } = {}) {
      this.clearHandshakeTimers();
      this.stopKeepAlive();
      const socket = this.socket;
      this.socket = null;
      if (socket) {
        try {
          socket.close();
        } catch {}
      }
      this.connected = false;
      this.handshakeSent = false;
      this.flushPending('socket closed');
      if (!silent) {
        this.onDisconnected('socket closed');
      }
    }

    computeReconnectDelayMs() {
      const attempt = Math.max(0, this.reconnectAttempt);
      const base = Math.min(this.maxReconnectMs, this.reconnectBaseMs * Math.pow(this.reconnectFactor, attempt));
      const jitter = base * this.reconnectJitter * Math.random();
      return Math.floor(base + jitter);
    }

    async maybeReconnect(reason) {
      if (this.manualDisconnect) return;
      if (!this.isAuthed()) return;
      if (this.reconnectTimer) return;

      if (!this.isOnline()) {
        this.onStatus('offline', 'waiting for network...');
        return;
      }

      if (this.checkAuth) {
        let auth;
        try {
          auth = await this.checkAuth();
        } catch {
          auth = { reachable: false, authed: true };
        }
        if (!auth?.reachable) {
          this.reconnectAttempt = Math.min(this.maxReconnectAttempts, this.reconnectAttempt + 1);
          const delayMs = this.computeReconnectDelayMs();
          this.onStatus('reconnecting', `server offline; retrying in ${Math.ceil(delayMs / 1000)}s`);
          this.reconnectTimer = this.timers.setTimeout(() => {
            this.reconnectTimer = null;
            this.connect({ isRetry: true });
          }, delayMs);
          return;
        }
        if (!auth?.authed) {
          this.onAuthExpired();
          return;
        }
      }

      this.reconnectAttempt = Math.min(this.maxReconnectAttempts, this.reconnectAttempt + 1);
      const delayMs = this.computeReconnectDelayMs();
      this.onStatus('reconnecting', `${reason}; retrying in ${Math.ceil(delayMs / 1000)}s`);
      this.reconnectTimer = this.timers.setTimeout(() => {
        this.reconnectTimer = null;
        this.connect({ isRetry: true });
      }, delayMs);
    }

    async connect({ isRetry = false } = {}) {
      if (!this.isAuthed()) {
        this.onStatus('disconnected', 'sign in required');
        return;
      }
      if (!this.WebSocketImpl) {
        this.onStatus('error', 'WebSocket unavailable');
        return;
      }

      this.manualDisconnect = false;
      this.clearReconnectTimer();

      try {
        await this.prepare();
      } catch (err) {
        this.onStatus('error', err ? String(err) : 'prepare failed');
        this.onDisconnected('prepare failed');
        this.maybeReconnect('prepare failed');
        return;
      }

      const url = this.getUrl();
      if (!url) {
        this.onStatus('error', 'missing ws url');
        this.onDisconnected('missing ws url');
        return;
      }

      this.closeSocket({ silent: true });
      this.onDisconnected('connecting');
      this.challenge = null;

      const socket = new this.WebSocketImpl(url);
      this.socket = socket;

      socket.addEventListener('open', () => {
        if (socket !== this.socket) return;
        this.handshakeSent = false;
        this.onStatus(isRetry ? 'reconnecting' : 'connecting', 'waiting for challenge...');
        this.connectTimer = this.timers.setTimeout(() => this.sendConnect(), this.challengeWaitMs);
        this.handshakeTimeoutTimer = this.timers.setTimeout(() => {
          if (socket !== this.socket) return;
          if (this.connected) return;
          this.onStatus('error', 'handshake timeout');
          this.closeSocket({ silent: true });
          this.onDisconnected('handshake timeout');
          this.maybeReconnect('handshake timeout');
        }, this.handshakeTimeoutMs);
      });

      socket.addEventListener('message', (event) => {
        if (socket !== this.socket) return;
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        if (data?.type === 'event' && data.event === 'connect.challenge') {
          this.challenge = data.payload;
          this.sendConnect();
        }

        if (data?.type === 'res' && data.id && this.pending.has(data.id)) {
          const resolver = this.pending.get(data.id);
          this.pending.delete(data.id);
          resolver(data);
        }

        try {
          this.onFrame(data);
        } catch {}
      });

      socket.addEventListener('close', (event) => {
        if (socket !== this.socket) return;
        const code = event && typeof event.code === 'number' ? event.code : null;
        const reason = event && typeof event.reason === 'string' ? event.reason : '';
        const detail = code ? `socket closed (${code})${reason ? ` ${reason}` : ''}` : 'socket closed';
        this.onStatus('disconnected', detail);
        this.closeSocket({ silent: true });
        this.onDisconnected(detail);
        const reasonLower = reason.toLowerCase();
        if (
          code === 4401 ||
          (code === 1008 && (reasonLower.includes('unauthorized') || reasonLower.includes('forbidden')))
        ) {
          this.onAuthExpired();
          return;
        }
        this.maybeReconnect('disconnected');
      });

      socket.addEventListener('error', () => {
        if (socket !== this.socket) return;
        this.onStatus('error', 'socket error');
        this.closeSocket({ silent: true });
        this.onDisconnected('socket error');
        this.maybeReconnect('socket error');
      });
    }

    startKeepAlive() {
      if (!this.keepAlive) return;
      this.stopKeepAlive();
      this.keepAliveTimer = this.timers.setInterval(() => {
        if (!this.connected) return;
        const req = this.keepAlive();
        if (!req || !req.method) return;
        this.request(req.method, req.params || {});
      }, this.keepAliveMs);
    }

    sendConnect() {
      if (!this.socket || this.connected || this.handshakeSent) return;
      if (this.socket.readyState !== 1) return; // OPEN

      if (this.connectTimer) {
        this.timers.clearTimeout(this.connectTimer);
        this.connectTimer = null;
      }

      const payload = {
        type: 'req',
        id: randomId(),
        method: 'connect',
        params: this.buildConnectParams(this.challenge)
      };

      this.handshakeSent = true;
      this.requestRaw(payload).then((res) => {
        if (res?.ok) {
          this.connected = true;
          this.clearHandshakeTimers();
          this.reconnectAttempt = 0;
          this.onStatus('connected', '');
          this.onConnected(res.payload || {});
          this.startKeepAlive();
        } else {
          const errorCode = res?.error?.code ? String(res.error.code) : '';
          const errorMessage = res?.error?.message ? String(res.error.message) : '';
          const detail = (errorCode ? `${errorCode}: ` : '') + (errorMessage || 'connect failed');
          const retryReason =
            detail === 'connect failed' ? 'connect failed' : `connect failed: ${detail.slice(0, 160)}`;
          this.connected = false;
          this.onStatus('error', detail.slice(0, 220));
          this.handshakeSent = false;
          this.closeSocket({ silent: true });
          this.onDisconnected('connect failed');
          this.maybeReconnect(retryReason);
        }
      });
    }

    request(method, params = {}) {
      return this.requestRaw({
        type: 'req',
        id: randomId(),
        method,
        params
      });
    }

    requestRaw(payload) {
      return new Promise((resolve) => {
        if (!this.socket || this.socket.readyState !== 1) {
          resolve({ type: 'res', id: payload.id, ok: false, error: { message: 'socket not open' } });
          return;
        }

        const timer = this.timers.setTimeout(() => {
          this.pending.delete(payload.id);
          resolve({ type: 'res', id: payload.id, ok: false, error: { message: 'request timeout' } });
        }, this.requestTimeoutMs);

        this.pending.set(payload.id, (res) => {
          this.timers.clearTimeout(timer);
          resolve(res);
        });

        try {
          this.socket.send(JSON.stringify(payload));
        } catch (err) {
          this.timers.clearTimeout(timer);
          this.pending.delete(payload.id);
          resolve({ type: 'res', id: payload.id, ok: false, error: { message: String(err) } });
        }
      });
    }

    disconnect(silent = false) {
      this.manualDisconnect = true;
      this.clearReconnectTimer();
      this.onStatus('disconnected', 'manual disconnect');
      this.closeSocket({ silent: true });
      if (!silent) {
        this.onDisconnected('manual disconnect');
      }
    }
  }

  return { GatewayClient, randomId };
});

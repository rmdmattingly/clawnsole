# HTTPS / TLS for Clawnsole

If you see **ERR_SSL_PROTOCOL_ERROR** when visiting Clawnsole over `https://…`, it almost always means the endpoint on **port 443 is not actually speaking TLS** (e.g. plain HTTP on 443), or a reverse proxy/CDN is misconfigured.

Clawnsole itself is typically run as plain HTTP on a local port (e.g. `127.0.0.1:5173`). The correct fix is to **terminate TLS in front of Clawnsole** using a reverse proxy such as **Caddy** or **nginx**, then proxy to the app over HTTP.

## Recommended: Caddy (TLS termination)

### Caddyfile (public hostname)

Replace:
- `<clawnsole-hostname>` with your real DNS name (e.g. `clawnsole-qa.example.com`)
- `<clawnsole-port>` with the current active Clawnsole port (e.g. `5173`)

```caddyfile
<clawnsole-hostname> {
  encode zstd gzip
  reverse_proxy 127.0.0.1:<clawnsole-port>
}

http://<clawnsole-hostname> {
  redir https://{host}{uri} permanent
}
```

Notes:
- Caddy will automatically obtain and renew a Let’s Encrypt certificate for publicly-valid hostnames.
- WebSockets are supported automatically.

### Hardening (recommended)
- Bind Clawnsole only to localhost.
- Only expose ports **80/443** publicly.

## Common causes of ERR_SSL_PROTOCOL_ERROR

- **Nothing is terminating TLS** on :443.
- A proxy is bound to :443 but configured for **HTTP** instead of TLS.
- Cloudflare (or another CDN) SSL mode mismatch (e.g. “Flexible” vs “Full”).

## Quick debug commands

From a machine that can reach the host:

```bash
curl -v http://<host>
curl -vk https://<host>

# Shows the TLS handshake + certificate chain if TLS is configured correctly.
openssl s_client -connect <host>:443 -servername <host>
```

Expected:
- `openssl s_client` prints a certificate chain and negotiates TLS 1.2+.
- `curl -vk https://…` connects and returns an HTTP response.

## Local development (clawnsole.local)

The default installer sets up `http://clawnsole.local` for convenience.

If you want `https://` locally, you’ll need to configure trusted local certs (e.g. Caddy internal CA or mkcert) and trust that CA in your OS/browser.

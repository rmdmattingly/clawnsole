# HTTPS / TLS termination

Clawnsole's Node server (`server.js`) serves **HTTP only**.

If you point a browser at `https://<host>` without a TLS terminator in front, you'll typically see:

- `ERR_SSL_PROTOCOL_ERROR`

That error almost always means the endpoint on `:443` is **not speaking TLS** (it is plain HTTP, or nothing is listening).

## Recommended: terminate TLS with Caddy

Caddy is the simplest option because it:

- automatically obtains/renews Let's Encrypt certificates for public hostnames
- proxies HTTP and WebSockets without extra configuration
- can redirect HTTP → HTTPS

### 1) Ensure your hostname + firewall are correct

- Create a DNS `A`/`AAAA` record for your hostname pointing to the server.
- Open inbound ports **80** and **443**.

### 2) Run Clawnsole on localhost (HTTP)

Example (systemd, pm2, docker, etc.):

- Clawnsole binds to `127.0.0.1:5173` (or any port)
- Do **not** expose that port publicly

### 3) Put Caddy in front

Use the example files:

- `examples/Caddyfile`
- `examples/docker-compose.caddy.yml`

Minimal Caddyfile:

```caddyfile
clawnsole.example.com {
  encode zstd gzip

  # Forward to the HTTP-only Clawnsole server.
  reverse_proxy 127.0.0.1:5173
}

http://clawnsole.example.com {
  redir https://{host}{uri} permanent
}
```

## Notes for Cloudflare / existing proxies

If you already have a reverse proxy or Cloudflare in front:

- confirm the edge terminates TLS
- ensure the origin/upstream to Clawnsole is `http://127.0.0.1:<port>` (unless you add TLS yourself)
- ensure WebSockets are enabled

## Debug checklist

From a machine that can reach the host:

```bash
curl -v http://<host>
curl -vk https://<host>
openssl s_client -connect <host>:443 -servername <host>
```

Expected:

- `openssl s_client` negotiates TLS 1.2+ and shows a certificate chain
- `http://` redirects to `https://`
- the site loads without protocol errors

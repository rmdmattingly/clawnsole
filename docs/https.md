# HTTPS / TLS for Clawnsole

Clawnsole itself is an **HTTP** server (it does not speak TLS). For browser-compatible `https://` access you must **terminate TLS in front of Clawnsole** and reverse-proxy to it over plain HTTP.

## Default install (`clawnsole.local` on macOS)

The installer uses **Caddy** as a local reverse proxy.

- `http://clawnsole.local` redirects to `https://clawnsole.local`
- `https://clawnsole.local` is served with a **Caddy internal certificate** (`tls internal`)

The first time you visit the HTTPS URL your browser may show a certificate warning until you trust Caddy's local CA.

To trust Caddy's local CA (macOS):

```bash
sudo /opt/homebrew/bin/caddy trust
```

Then reload `https://clawnsole.local`.

## Public hostname (recommended)

For a real domain with DNS pointing at the server (ports 80/443 open), you can use Caddy with Let's Encrypt:

```caddyfile
# Replace with your real hostname
clawnsole.example.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:5173
}

http://clawnsole.example.com {
  redir https://{host}{uri} permanent
}
```

Caddy handles WebSockets automatically.

## Debugging

If `https://` fails, confirm port 443 is speaking TLS:

```bash
openssl s_client -connect clawnsole.example.com:443 -servername clawnsole.example.com
```

A working setup shows a certificate chain and negotiated TLS version (TLS 1.2/1.3).

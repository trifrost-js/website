The TriFrost App automatically picks up configuration from the following env vars:

---

### 🟦 Core Configuration

##### app name
Sets the app name, used for example in otel telemetry.

- Variable priority: `TRIFROST_NAME` → `SERVICE_NAME`
- Example: `'my-service'`
- Default: `'trifrost'`

##### app version
Sets the app version, used for example in otel telemetry.

- Variable priority: `TRIFROST_VERSION` → `SERVICE_VERSION` → `VERSION`
- Example: `'0.9.1'`
- Default: `'1.0.0'`

---

### 🌐 Networking

##### host
Sets the known host internally (important to note that **if trust proxy is not enabled**, this is the **only way to determine host**). Used in otel telemetry and behaviors such as redirect.

- Variable priority: `TRIFROST_HOST` → `SERVICE_HOST` → `HOST`
- Example: `'trifrost.dev'`
- Default: `'0.0.0.0'`

##### port
Used in non-edge runtimes (Node/Bun) to determine what port to bind to.

- Variable priority: `TRIFROST_PORT` → `SERVICE_PORT` → `PORT`
- Example: `8080`
- Default: `3000`

---

### 🛡 Proxy Trust

Sets whether to trust proxy headers. Each runtime has their own default (`workerd=true`, `node/bun=false`).
**Proxy trust allows internal logic to look at headers to determine host, IP address, etc.**
Only enable this if you're behind a trusted proxy or gateway.

- Variable priority: `TRIFROST_TRUSTPROXY` → `SERVICE_TRUSTPROXY` → `TRUSTPROXY`
- Example: `true`
- Default: *runtime-specific* (`workerd=true`, `node/bun=false`)

---

### 🧪 Dev Mode

Enables dev mode.
**Only set this for local development** — it enables relaxed behaviors and more verbose output.

- Variable priority: `TRIFROST_DEV`
- Example: `true`
- Default: `false`

---

### 🐛 Debug

Enables debug logs and verbose runtime output.

- Variable priority: `TRIFROST_DEBUG` → `DEBUG`
- Example: `true`
- Default: `false`

👉 Also see: [Dev Mode](/docs/utils-devmode)

---

### 📄 Full Example

This is an example `.env` file you could use locally or in CI:

```bash
# .env

# App identity
TRIFROST_NAME="my-service"
TRIFROST_VERSION="0.9.1"

# Runtime binding (only used for Node/Bun)
TRIFROST_PORT="8080"
TRIFROST_HOST="trifrost.dev"

# Proxy trust (only enable if you're behind something like Cloudflare or a trusted load balancer)
TRIFROST_TRUSTPROXY="true"

# Dev/debug mode (should only be set in local/dev environments)
TRIFROST_DEV="true"
TRIFROST_DEBUG="true"
```

---

### Resources
- [App Class](/docs/app-class)
- [Dev Mode](/docs/utils-devmode)
- [Logging & Observability](/docs/logging-observability)

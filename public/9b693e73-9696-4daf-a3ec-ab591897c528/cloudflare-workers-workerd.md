TriFrost runs natively on [Workerd](https://github.com/cloudflare/workerd), the runtime powering [Cloudflare Workers](https://workers.cloudflare.com/).

This gives you **instant edge-deployment**, **tiny cold starts**, and deep integration with **Durable Objects, KV**, and other Cloudflare primitives, all without vendor lock-in.

This guide covers the specifics of running TriFrost on Workerd, including deployment, configuration, and edge/runtime quirks.

---

### Why Workerd?
Workerd is:
- 🌍 **Globally distributed**: deploys run in 300+ PoPs
- ⚡ **Fast cold starts**: sub-millisecond response latency
- 🧳 **Resource-efficient**: perfect for zero-to-scale workloads
- 🧩 Integrated with Cloudflare KV, Durable Objects, etc.

TriFrost is built to plug right in:
- Full support for Workers bindings and runtime APIs
- Built-in adapter, fetch-based handling
- Native support for Durable Objects and KV via TriFrost modules

---

### Minimum Required Setup
We recommend:
- ✅ **Wrangler v4+**
- ✅ **Workerd compatibility_date >= 2025-01-01**
- ⚠️ Enable `nodejs_compat` flag in `wrangler.toml`

---

### Hello World Example
You can scaffold a Workerd project in seconds:
```bash
npm create trifrost@latest
```

Then choose:
- Runtime: `Cloudflare Workers`
- Optional modules: Durable Object Cache, Styling, etc.

Or build it manually:
```bash
npm install @trifrost/core
npm install -D wrangler
```
```typescript
// src/index.tsx
import {App} from '@trifrost/core';

const app = await new App()
  .get('/', ctx => ctx.text('Hello from the edge!'))
  .boot();

export default app;
```

And in your `wrangler.toml`:
```bash
name = "trifrost_edge"
main = "src/index.ts"
compatibility_date = "2025-05-08"
compatibility_flags = ["nodejs_compat"]
```

Workerd expects a global `fetch` handler, by exporting your TriFrost `app` instance (which includes `.fetch`) you ensure this works.

👉 Learn more about the [Creation CLI](/docs/cli-quickstart) and [Hello World Example](/docs/hello-world-example)

---

### Durable Objects
To use TriFrost’s `DurableObjectCache` and `DurableObjectRateLimit`, you **must export** the underlying DO class from your index.ts:

```typescript
export {TriFrostDurableObject} from '@trifrost/core';
```

And register it in `wrangler.toml`:
```bash
[[durable_objects.bindings]]
name = "MainDurable"
class_name = "TriFrostDurableObject"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["TriFrostDurableObject"]
```

👉 See also: [Caching](/docs/cache-api) | [RateLimit](/docs/ratelimiting-api)

---

### Dev Mode & Tracing
Workerd runs locally via:
```bash
npx wrangler dev
```

Set up `.dev.vars` for local config:
```bash
TRIFROST_DEV=true
```

This enables local tracing via `ConsoleExporter`

---

### Secrets & Deployment
For production deployments and secure environment values, use Wrangler's built-in secret system:
```bash
npx wrangler secret put MY_SECRET
```

This stores `MY_SECRET` securely in Cloudflare and makes it available in `ctx.env` on production.

For local dev place this same secret in `.dev.vars` (NOT `wrangler.toml`).

> You can define **public variables** in `wrangler.toml`, but **never put secrets there**.
> Instead, use `.dev.vars` for local development and `wrangler secret` for production.

To deploy your app:
```bash
npx wrangler deploy
```

If you used the [Creation CLI](/docs/cli-quickstart) you can also run:
```bash
npm run deploy
```

This wraps `wrangler deploy` with any additional preflight logic.

---

### Cloudflare-Specific Gotchas
- ✅ Always export your app (`export default app`), Workerd expects a global `fetch`.
- ✅ Always export `TriFrostDurableObject` if using Durable Object Cache/RateLimit.
- ✅ Create secrets in your production apps using `npx wrangler secret put MYSECRET`
- ❗ Durable Objects must be explicitly registered in wrangler.toml.
- ❗ To use `.env` style vars, use `[vars]` in your `wrangler.toml` and place local secrets in `.dev.vars`, **not .env files**.
- 🛠 Use `compatibility_flags = ["nodejs_compat"]` for best API coverage.
- ⚠️ Use ctx.logger for structured logs.

---

### 🔧 Generated Project Structure
A default **Cloudflare Workers/Workerd** project will include:
```bash
/src
  ├── index.ts          ← Entrypoint
  ├── css.ts            ← Styling system
  ├── script.ts         ← Scripting system
  ├── routes/           ← Route handlers
  ├── components/       ← JSX components
  ├── types.ts          ← Env/Context types

/public
  ├── logo.svg
  ├── favicon.ico

wrangler.toml
.dev.vars
tsconfig.json
package.json
.prettierrc
eslint.config.mjs
```

All routes and assets fully scaffolded by the [Creation CLI](/docs/cli-quickstart), no config needed.

---

### TLDR
- Workerd is ideal for **edge-deployed, globally available apps**
- TriFrost exports a `.fetch`-compatible handler automatically
- Use Wrangler v4+, `nodejs_compat`, and `.dev.vars` for smooth local dev
- Durable Object Cache requires `TriFrostDurableObject` export + binding
- All edge APIs are supported, including KV, R2, DO, etc.

---

### Next Steps
- [App Class & Configuration](/docs/app-class)
- [Atomic Hydration](/docs/jsx-atomic)
- [Creation CLI](/docs/cli-quickstart)
- [Dev Mode](/docs/utils-devmode)
- [Environment Config](/docs/utils-envvars)
- [Hello World Example](/docs/hello-world-example)
- [JSX Basics](/docs/jsx-basics)
- [Logging & Observability](/docs/logging-observability)
- [Node](https://nodejs.org/)
- [Podman](https://podman.io)
- [Routing Basics](/docs/routing-basics)
- [Runtime: Bun](/docs/bun-runtime)
- [Runtime: Node](/docs/nodejs-runtime)

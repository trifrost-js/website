TriFrost includes a tiny but powerful utility called `isDevMode()` that helps your app know: **"Am I in development or production?"**

This utility enables environment-aware behavior like tracing, logging, debugging, and more — and it’s runtime-agnostic.

---

### What is isDevMode()
```typescript
import {isDevMode} from '@trifrost/core';

function (ctx:Context) {
  isDevMode(ctx.env); // true | false
}
```

It accepts your app’s env object and returns a boolean:
- **true**: You're in dev mode
- **false**: You're **not** in dev mode

For Example:
```typescript
if (isDevMode(ctx.env)) {
  ctx.logger.debug('Running in dev mode!');
} else {
  ctx.logger.info('Production mode – tracing enabled');
}
```

You can use this to toggle:
- Logging verbosity
- Mock vs. real data
- Exporters
- Feature flags
- ...

---

### How It Works
It follows a layered check strategy:

##### 1. TRIFROST_DEV env variable
If your env contains `TRIFROST_DEV`, it takes priority.

Accepted values:
- `'true'`, `'1'` → **true**
- `'false'`, `'0'` → **false**

```yaml
# .env or .dev.vars
TRIFROST_DEV=true
```

##### 2. Fallback: NODE_ENV
If `TRIFROST_DEV` is **not set**, it checks:
```typescript
NODE_ENV !== 'production'
```
This ensures safe defaults in traditional environments.

##### 3. Default
If neither are provided, it falls back to `false` (production mode).

---

### ✨ Behavior in Dev Mode
TriFrost’s internal tracing + observability changes behavior based on dev mode status:

- **Dev mode**\nAll runtimes will default to using [ConsoleExporter](/docs/exporters-console) with **no inclusions**
- **Prod Mode**\nNode/Bun/uWS will default to using [ConsoleExporter](/docs/exporters-console) with `trace_id` inclusion\nWorkerd will default to using [JsonExporter](/docs/exporters-json)

> ✅ In **dev mode**, all runtimes fall back to `ConsoleExporter` to make debugging easy and consistent — even on the edge.

---

### 🧪 Best Practice
To ensure consistency, **always explicitly** set TRIFROST_DEV in your **local dev** environment file.

**Local (Node, Bun, uWS):**
```toml
# .env
TRIFROST_DEV=true
```

**Cloudflare Workers:**
```toml
# .dev.vars (wrangler)
TRIFROST_DEV=true
```

---

### TLDR
- `isDevMode(env)` → returns `true` or `false`
- Checks `TRIFROST_DEV` first, then `NODE_ENV`
- In dev mode, all runtimes log to console
- In prod, tracing/exporters adapt to runtime
- Set `TRIFROST_DEV=true` locally to opt-in

---

### Resources
- [Logging & Observability](/docs/logging-observability)
- [Context & State Management](/docs/context-state-management)

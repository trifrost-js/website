TriFrost's `App` class is the **entrypoint to your server**. It manages routing, runtime integration, observability, lifecycle hooks, and core configuration like cookies, cache, tracing, and JSX hydration.

You typically instantiate `App` once per deployment, whether that’s on Node, Bun, or Workerd, and everything flows through it.

👉 See also: [Routing Basics](/docs/routing-basics) | [Request Lifecycle](/docs/request-response-lifecycle)

---

### 🚀 Creating an App

TriFrost apps are created via `new App(...)`. You can optionally pass runtime modules, caching, cookies, tracing, and more:

```ts
import {App, RedisCache, ConsoleExporter} from '@trifrost/core';
import {css} from './css';
import {script} from './script';

const app = new App({
  tracing: {
    exporters: () => [new ConsoleExporter()],
  },
  cache: new RedisCache({ store: () => redis /* Your redis instance */ }),
  client: {css, script},
});
```

You can configure:
- Runtime (Node, Bun, Workerd, etc)
- Tracing and exporters
- Cookie config (default options)
- Cache store
- Default timeout
- JSX hydration behavior (client)
- ...

> **Note:** Runtime is **automatically detected**, you should **not have to pass this manually**.

👉 See also: [Hello World Example](/docs/hello-world-example) | [Runtime Adapters](/docs/supported-runtimes)

---

### 🧭 Prefer a guided setup?
You can let the CLI scaffold everything for you, including runtime setup, middleware, styling, and more.

Run:
```bash
# Bun
bun create trifrost@latest

# NPM
npm create trifrost@latest
```

... and you’ll get a fully functional project in under a minute.

[▶️ See the CLI in action](/docs/cli-quickstart)

---

### ⚙️ Configuration Options
When constructing an app, you can pass any of the following options:
```typescript
new App({
  cache,      // Cache adapter (Redis, Memory, etc)
  client,     // Client object containing css/script setup for auto-mounting atomic
  cookies,    // Global cookie defaults
  env,        // Custom object to be added ON TOP OF the detected environment env
  rateLimit,  // Rate Limiter Instance
  runtime,    // Custom runtime if no auto-detect is wanted
  timeout,    // Maximum timeout in milliseconds globally (defaults to 30 000)
  tracing,    // Tracing config (exporters, requestId)
  trustProxy, // Whether to trust proxy headers (each runtime has their own default)
});
```

Example:
```typescript
new App<Env>({
  cache: new DurableObjectCache({
    store: ({env}) => env.MainDurable,
  }),
  tracing: {
    exporters: ({env}) => {
      if (isDevMode(env)) return [new ConsoleExporter()];
      return [
        new JsonExporter(),
        new OtelHttpExporter({
          logEndpoint: 'https://otlp.uptrace.dev/v1/logs',
          spanEndpoint: 'https://otlp.uptrace.dev/v1/traces',
          headers: {
            'uptrace-dsn': env.UPTRACE_DSN,
          },
        }),
      ];
    },
  },
  client: {css, script},
})
```

##### cache
TriFrost uses this cache to power `ctx.cache`. If omitted, it falls back to a `MemoryCache`. You can plug in Redis, Durable Objects, KV, or any custom adapter that implements the `TriFrostCache` interface.
```typescript
cache: new RedisCache({
  store: () => ... /* your redis instance */,
})
```

👉 Also see: [Caching](/docs/cache-api)

##### client
Provides JSX hydration support via `css` and `script` mounts. If set, TriFrost will automatically register routes for `/__atomics__/client.css` and `/__atomics__/client.js` to serve these fragments.
```typescript
client: {
  css: atomicCssInstance,
  script: compiledScript,
}
```
> This enables progressive hydration and style rehydration in SSR flows.

👉 Also see: [JSX Basics](/docs/jsx-basics) | [JSX Atomic](/docs/jsx-atomic)

##### cookies
Sets global defaults for all cookies set via `ctx.cookies.set(...)`.

Default:
```typescript
cookies: {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'Strict'
}
```

You can override these for all cookie calls globally:
```typescript
cookies: {
  sameSite: 'Lax',
  secure: true,
}
```

👉 Also see: [Cookies](/docs/cookies-api)

##### env
An object that **extends** the current runtime's environment, useful for injecting additional configuration that **does not live on the environment**.
```typescript
env: {
  MYHAPPY_VARIABLE: true,
  ...
}
```
> This is **merged on top of** the runtime's `process.env`, `Bun.env`, or `env` object (Workerd).

##### rateLimit
Optional rate limiter instance — supports Redis, KV, Durable Objects, etc. If provided, routes/groups can call `.limit(...)` and TriFrost will auto-enforce quotas.
```typescript
rateLimit: new RedisRateLimit({
  store: () => ... /* your redis instance */,
}),
```

Use `app.limit(...)`, `router.limit(...)`, or `route.limit(...)` to apply limits.

👉 Also see: [RateLimiting](/docs/ratelimiting-api)

##### runtime
Override the runtime manually if needed (rare). Usually you **don't need to do this**, TriFrost **auto-detects Bun, Node, or Workerd**.

Example:
```typescript
import {NodeRuntime} from '@trifrost/core/runtimes/Node/Runtime';

...
runtime: new NodeRuntime(),
```

👉 Also see: [Supported Runtimes](/docs/supported-runtimes)

##### timeout
Sets the default timeout for all routes and requests, in **milliseconds**. This can be overridden per route or group.
```typescript
timeout: 15_000, // 15 seconds
```

If `null`, disables timeout globally (not recommended unless you're building a streaming service).

> Defaults to `30_000` (30 seconds).

##### tracing
TriFrost supports structured logging and tracing via configurable exporters and trace ID propagation.
```typescript
tracing: {
  exporters: () => [new ConsoleExporter()],
  requestId: {
    inbound: ['x-request-id'],
    outbound: 'x-request-id',
    validate: id => id.length > 8,
  }
}
```

You can return a **single exporter, or an array**. TriFrost will normalize it.

👉 Also see: [Console Exporter](/docs/exporters-console) | [JSON Exporter](/docs/exporters-json) | [OTEL Exporter](/docs/exporters-otel)

---

### 🔧 Environment Variables
The TriFrost App automatically picks up configuration from a whole slew of environment variables.

These variables allow for **app name/version**, **networking port**, **proxy trust**, **dev mode**, **debug** and more.

For a full overview see:
- [Core Concepts: Environment Variables](/docs/utils-envvars)
- [Core Concepts: Dev Mode](/docs/utils-devmode)

---

### 📦 Routing
The `App` class **inherits from** [Router](/docs/router-route), meaning you can call any routing methods directly:
```typescript
app.get('/status', (ctx) => ctx.text('ok'));
app.patch('/users/:userId', async (ctx) => {
  console.log('patching user', ctx.state.userId, 'with', ctx.body);

  return ctx.json({ received: ctx.body });
});
```

All of these work:
```typescript
app.get(...)          // Add a HTTP GET route
app.post(...)         // Add a HTTP POST route
app.put(...)          // Add a HTTP PUT route
app.patch(...)        // Add a HTTP PATCH route
app.del(...)          // Add a HTTP DELETE route
app.health(...)       // Add a GET route specifically for health checks
app.route(...)        // Add a subroute with a builder approach
app.group(...)        // Add a subrouter with dynamic path handling
app.onNotFound(...)   // Configure a catch-all not found handler
app.onError(...)      // Configure a catch-all error handler
app.limit(...)        // Configure limit for this part of the chain
app.bodyParser(...)   // Configure bodyparser for this part of the chain
app.use(...)          // Add a middleware to the router
```

> Routes registered directly on app are equivalent to root-level routes — they live at the top of the route tree.

👉 See: [Router & Route](/docs/router-route) | [Routing Basics](/docs/routing-basics)

---

### 🧬 Lifecycle
##### app.boot()
Boots the runtime and wires up the server.
```typescript
await app.boot();
```

This:
- If no runtime is detected, detects the runtime (node/bun/workerd/...) based on heuristics
- Boots up the runtime
- Registers the `.onIncoming(...)` handler with the runtime
- Attaches route handling, tracing, and lifecycle hooks
- Resolves once the runtime is listening (or ready)
- Is safe to call multiple times (noop after first run)

> **Required before requests will be handled**

##### app.shutdown()
Shuts down the runtime (eg: closes the server in bun/node)
```typescript
await app.shutdown();
```

---

### 📥 Inbound Tracing
When `tracing.requestId.inbound` is set (default: `['x-request-id', 'cf-ray']`), TriFrost will:
- Accept an inbound trace ID header
- Use it as the root of the logger trace context
- Auto-propagate it to outbound fetches

Set it to `[]` to disable entirely.
```typescript
tracing: {
  requestId: {
    inbound: ['x-request-id'], // accepted inbound header
    outbound: 'x-request-id',  // header sent on ctx.fetch(...) with the trace id
    validate: val => ..., // validation method to validate for a proper id format
  }
}
```

The default setting is:
```typescript
requestId: {
  inbound: ['x-request-id', 'cf-ray'],
  outbound: 'x-request-id',
  validate: val => /^[a-z0-9-]{8,64}$/i.test(val),
}
```

👉 See: [Logging & Observability](/docs/logging-observability)

### Best Practices
- ✅ Call `await app.boot()` before handling any requests
- ✅ Use `.health(...)` for readiness/liveness probes, they are excluded from tracing/logging
- 🚫 Never manually call `runtime.boot()` — use `App.boot()` instead
- ✅ For custom exporters, prefer a function that returns an array (TriFrost will wrap singletons automatically)
- ✅ Avoid setting `runtime` and `env` unless you're fully overriding behavior
- ✅ Make use of the `isDevMode` utility to switch between configurations for dev/prod

---

### Related
- [Core Concepts: Environment Variables](/docs/utils-envvars)
- [Core Concepts: Dev Mode](/docs/utils-devmode)
- [Context Object](/docs/context-api)
- [Environment Variables](/docs/canonical-environment-variables)
- [Hello World Example](/docs/hello-world-example)
- [Router & Route](/docs/router-route)
- [Routing Basics](/docs/routing-basics)
- [Middleware Basics](/docs/middleware-basics)
- [Request & Response Lifecycle](/docs/request-response-lifecycle)
- [Logging & Observability](/docs/logging-observability)
- [Runtimes](/docs/supported-runtimes)
- [Runtime Guide: NodeJS](/docs/nodejs-runtime)
- [Runtime Guide: Bun](/docs/bun-runtime)
- [Runtime Guide: WorkerD](/docs/cloudflare-workers-workerd)

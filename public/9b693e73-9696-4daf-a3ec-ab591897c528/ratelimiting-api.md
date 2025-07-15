TriFrost ships with built-in **rate limiting** powered by composable middleware, per-route control, and runtime-adaptive storage.

Whether you want global request caps, per-endpoint limits, or sliding-window smoothing, it’s a first-class citizen of the router tree.

> `limit(...)` works at every level: app, group, and route.

👉 See also: [Routing Basics](/docs/routing-basics) | [Middleware Basics](/docs/middleware-basics) | [Context API](/docs/context-api)

---

### 🚥 Declaring Rate Limits

TriFrost exposes a `limit(...)` method on:
- `App` (global)
- `Router`/`.group(...)` (shared)
- `Route`/`.route(...)` (fine-grained)

```ts
app.limit(100); // global cap — 100 reqs per window

app.group('/api', (r) => {
  r
    .limit(50) // group-level limit
    .get('/posts', ctx => ctx.text('ok'));

  r.route('/users', (route) => {
    route
      .limit(10) // per route
      .get(ctx => ctx.text('get user'))
      .post(ctx => ctx.text('create user'));
  });
});
```

All limits apply **per client key** (usually IP + route) and are enforced via middleware.

---

### ⚙️ How It Works
Rate limiting is powered by the `TriFrostRateLimit` class, which handles:
- Windowing (fixed or sliding)
- Key bucketing (IP, route, etc)
- Storage (memory, KV, Redis, DO)
- Headers + exceeded handling

To enable it, pass a `rateLimit` instance when creating your app:
```typescript
import {MemoryRateLimit} from '@trifrost/core';

const app = new App({
  rateLimit: () => new MemoryRateLimit({
    strategy: 'sliding',
    window: 60
  }),
});
```

From there, `.limit(...)` becomes available across all routers and routes.

---

### 📦 Strategies
TriFrost supports two strategies:

##### fixed (default)
- Uses a static time window
- Resets all usage every N seconds
- Good for consistent enforcement (e.g. "100 requests per minute")

##### sliding
- Tracks timestamps per request
- Always evaluates a rolling window
- Smoother under load; avoids burstiness
```typescript
new MemoryRateLimit({ strategy: 'sliding', window: 60 });
```

> Both modes store usage and TTL; the difference is **how** the window is evaluated.
> The **default window** is **60 seconds**.

---

### 🔑 Key Generation
Each request is hashed into a bucket key to track its usage.

TriFrost supports several built-in presets:
- `'ip'`: Just the client IP
- `'ip_name'`: IP + route name
- `'ip_method'`: IP + HTTP method
- `'ip_name_method'`: IP + route + method (default)

Or you can define your own:
```typescript
new MemoryRateLimit({
  keygen: (ctx) => `tenant:${ctx.env.TENANT_ID}:${ctx.state.user.id}`,
});
```

---

### 🧠 Dynamic Limits
You can provide either:
- A static number (e.g. `.limit(100)`)
- A function that returns a limit based on the current context:
```typescript
route.limit((ctx) => {
  return ctx.state.user?.tier === 'pro' ? 1000 : 100;
});
```

---

### ⚠️ Custom Handling
When a request exceeds the configured limit, TriFrost returns a `429 Too Many Requests` by default.

You can override this:
```typescript
new MemoryRateLimit({
  exceeded: (ctx) => {
    ctx.setStatus(429);
    return ctx.text('Slow down!');
  },
});
```

You can log, redirect, noop, or even let them through, it’s up to you.

---

### 📡 Rate Limit Headers
By default, TriFrost will automatically set these headers:
- `x-ratelimit-limit`: max allowed
- `x-ratelimit-remaining`: remaining requests
- `x-ratelimit-reset`: UNIX time when the window resets
- `retry-after`: seconds until retry

You can disable headers if you want a stealth limiter:
```typescript
new MemoryRateLimit({ headers: false });
```

Only the `retry-after` header will be set in that case.

---

### 💾 Storage Backends
Rate limit usage is stored via TriFrost's `Store` abstraction. This lets you choose how/where to persist counters.

Below is an overview of the supported adapters.

##### Memory
- In-memory `Map`, no persistence
- Ideal for local dev or single-instance apps
- Fastest, but state is ephemeral
```typescript
import {App, MemoryRateLimit} from '@trifrost/core';
import {type Env} from './types';

const app = new App<Env>({
  rateLimit: () => new MemoryRateLimit({
    strategy: 'sliding', // or 'fixed'
    window: 60, // 60 seconds
  }),
});
```

##### KV (Cloudflare)
- Uses [Cloudflare KV](https://www.cloudflare.com/developer-platform/products/workers-kv/)
- Good for global availability
- **Eventual consistency** — may under- or over-count under heavy load
- Slower than DO or Redis for rapid reads/writes

**Note**: Cloudflare KV is eventually consistent and significantly slower than Durable Objects under high concurrency. It's best for soft-limiting or global distribution, not precise enforcement.

```typescript
import {App, KVRateLimit} from '@trifrost/core';

type Env = {
  MY_KV: KVNamespace;
};

const app = new App<Env>({
  rateLimit: ({env}) => new KVRateLimit({
    store: env.MY_KV,
    strategy: 'fixed',
    window: 60, // 60 seconds
  }),
});
```

In your `wrangler.toml`:
```bash
[[kv_namespaces]]
binding = "MY_KV"
id = "xxxxxx..."
```

##### Redis
- Traditional Redis (compatible with libs like `ioredis`)
- Great for clustered Node apps or centralized backends
- Low-latency and strongly consistent
```typescript
import {App, RedisRateLimit} from '@trifrost/core';
import Redis from 'ioredis';

const app = new App({
  rateLimit: ({env}) => new RedisRateLimit({
    store: new Redis(...),
    strategy: 'sliding',
    window: 60, // 60 seconds
  }),
});
```
> Note: any Redis client compatible with `.get`/`.set`/`.del`/`.scan` will work.

##### Durable Objects (Cloudflare)
- Uses a single [Cloudflare Durable Object](https://www.cloudflare.com/developer-platform/products/durable-objects/)
- **Sequential consistency** guarantees accurate limiting
- Ideal for billing, abuse prevention, or usage enforcement
- Requires manual registration and export (see below)

Compared to KV, Durable Objects offer lower latency and stronger consistency. They're ideal for precise control (e.g. billing, abuse prevention) and scale well under concurrency.

To use TriFrost's Durable Object-based rate limiter:
```typescript
import {App, DurableObjectRateLimit, TriFrostDurableObject} from '@trifrost/core';

type Env = {
  MainDurable: DurableObjectNamespace;
};

// Required for Workerd
export {TriFrostDurableObject};

const app = await new App<Env>({
  rateLimit: ({env}) => new DurableObjectRateLimit({
    store: env.MainDurable,
    strategy: 'sliding',
    window: 60,
  }),
})
	...
	.boot();

export default app;
```

In your `wrangler.toml`:
```bash
[[durable_objects.bindings]]
name = "MainDurable"
class_name = "TriFrostDurableObject"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["TriFrostDurableObject"]
```

> Workerd/Cloudflare requires DO classes to be explicitly exported and bound. If missing, rate limiting won't work.
> 👉 Learn more in: [Workerd Deployment Guide](/docs/cloudflare-workers-workerd)

---

### 🧪 Why rateLimit Is a Function
When configuring a rate limiter, TriFrost expects `rateLimit` to be a function that receives the current `{env}`.

This enables:
- Lazy initialization (e.g. when not all bindings are ready at startup)
- Runtime-specific resolution (DO/KV vary across regions or workers)
- Full access to typed `ctx.env` inside the adapter
- Ability to switch the rate limiting setup depending on the environment
```typescript
rateLimit: ({env}) => {
  if (isDevMode(env)) return new MemoryRateLimit({...});
  return new DurableObjectRateLimit({store: env.MainDurable, ...});
},
```

> This ensures your rate limiter integrates seamlessly with edge runtimes and supports async-compatible storage.

---

### TLDR
- `.limit(...)` works at any level
- Supports `.limit(...)` with dynamic functions
- Built-in `fixed` and `sliding` window strategies
- Works with Memory, Redis, KV, and Durable Objects
- Returns `429` on exceeded (customizable)
- Rate limit headers are on by default
- Excludes `.health(...)` routes automatically
- Default **window is 60 seconds**

---

### Best Practices
- ✅ Use `.limit(...)` at the highest level reasonable (app, group, or route)
- ✅ Prefer `sliding` strategy for public-facing traffic
- ✅ Use `fixed` for internal APIs or cost control
- ✅ Define custom `keygen` to shard by tenant, user, etc
- ✅ Disable `headers` if you want opaque behavior
- ✅ Don’t forget: `health` routes are automatically excluded

---

### Related
- [Dev Mode](/docs/utils-devmode)
- [Router & Route](/docs/router-route)
- [Routing Basics](/docs/routing-basics)
- [Context API](/docs/context-api)
- [Middleware Basics](/docs/middleware-basics)
- [Error & NotFound Handlers](/docs/error-notfound-handlers)

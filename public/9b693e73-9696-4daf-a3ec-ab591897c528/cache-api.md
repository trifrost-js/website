TriFrost ships with **built-in caching**, powered by the same storage abstraction as rate limiting.

Whether you're caching DB results, expensive computations, or third-party fetches, the API is fast, composable, and runtime-adaptive.

> Works with all TriFrost-supported stores: Memory, Redis, KV, and DurableObject.

👉 See also: [Rate Limiting](/docs/ratelimiting-api) | [Context API](/docs/context-api)

---

### ⚡ Declaring a Cache
To enable caching, pass a `cache` instance when initializing your app:
```typescript
import {App, MemoryCache} from '@trifrost/core';

const app = new App<Env>({
  cache: () => new MemoryCache({
    strategy: 'sliding',
    ttl: 60,
  }),
});
```

---

### 🔑 Basic Usage
You can use `ctx.cache` directly to get/set/delete values:
```typescript
app.get('/expensive', async (ctx) => {
  const data = await ctx.cache.wrap('some-key', async () => {
    const result = await expensiveFn();
    return result;
  }, {ttl: 120}); // cache for 2 minutes

  return ctx.json(data);
});
```

You can also manually control:
```typescript
await ctx.cache.set('user:123', user, {ttl: 300});
const cached = await ctx.cache.get('user:123');
await ctx.cache.del('user:123');
```

---

### 🧠 Automatic Method Caching
TriFrost supports **caching decorators** for class or standalone methods:
```typescript
import {cache} from '@trifrost/core';

class UserService {
  @cache((ctx) => `user:${ctx.state.userId}`, {ttl: 300})
  async getUser(ctx: Ctx) {
    return fetchUser(ctx.state.userId);
  }
}

```

Or use as a functional wrapper:
```typescript
const cachedFetch = cacheFn((ctx) => `user:${ctx.state.userId}`, {ttl: 60})(
  async function fetch(ctx) {
    return getFromDB(ctx.state.userId);
  }
);
```

---

### 🚫 Skipping Cache
Sometimes you want to **conditionally skip caching**, for example, when a fetch fails or returns an invalid result.

TriFrost provides a built-in way to opt out of caching via `ctx.cache.skip(...)` or the `cacheSkip(...)` helper:

**⛔ Inside .wrap(...)**
```typescript
const data = await ctx.cache.wrap('expensive:key', async () => {
  try {
    const result = await fetchStuff();
    return result;
  } catch (err) {
    ctx.logger.warn('Failed to fetch', err);
    return ctx.cache.skip(null); // ❌ don't cache failures
  }
});
```

**⛔ Inside a @cache(...) decorated method**
```typescript
import {cache} from '@trifrost/core';

class MyService {
  @cache(ctx => `user:${ctx.state.userId}`, {ttl: 300})
  async getUser(ctx) {
    try {
      return await fetchUser(ctx.state.userId);
    } catch {
      return ctx.cache.skip(null); // ❌ don't cache error state
    }
  }
}
```

**⛔ Or manually using the helper**
```typescript
import {cacheSkip} from '@trifrost/core';

const result = await fetchSomething();
if (!result.valid) return cacheSkip(result); // ❌ skip invalid entries
```

> ✅ Skipped results still return immediately — they just won’t be written to cache.

---

### 📦 TTL Semantics
You can provide `ttl` globally or per-call:
```typescript
cache.set('some-key', value, {ttl: 300}); // 5 minutes
```

If omitted, TriFrost uses the **global default passed to the cache constructor**.

> ✅ TTLs are in **seconds** (not milliseconds).

##### Adapter Notes
- **Memory**: TTL is enforced via `Date.now()` and internal GC, precision is sharp.
- **Redis**: TTL is natively supported via `EX`, precision is solid.
- **Durable Object**: TTL is respected manually (we manage expiry ourselves within the `TriFrostDurableObject` class).
- **Cloudflare KV**:\n- ⚠️ TTL must be **≥ 60 seconds**, anything lower will be clamped.\n- ⚠️ Setting `ttl: 0` will **not disable caching**, it may result in undefined behavior.\n- ⚠️ Deletion (`del(...)`) is respected but list batching may delay visibility.

> 💡 When using KV via Workerd, remember that TTL behavior is **eventually consistent** and can't be used for precise eviction or real-time logic.

---

### 🔄 Cache Invalidation
TriFrost lets you delete cache entries **explicitly**, either **by key** or **by prefix**.

**Delete by Key:**
```typescript
await ctx.cache.del('user:123');
```

Deletes a **specific** key from the store.

**Delete by Prefix:**
```typescript
await ctx.cache.del({prefix: 'user:'});
```

Deletes **all entries whose keys start with** `user:`. This is useful for:
- Invalidating all sessions for a user
- Flushing namespace groups (`product:*`, `page:*`, etc.)
- Triggering partial flushes after a write or deploy

##### Adapter Notes
- **Memory**: In-process Map; deletes are immediate
- **Redis**: Uses `SCAN` + `DEL`; safe for production (efficient with reasonable size)
- **Cloudflare KV**: Uses batched `.list()` and `.delete()`, slower under high key count
- **Cloudflare DurableObject**: Prefix-based deletion is built into the internal `TriFrostDurableObject` storage logic

> Cloudflare KV prefix deletion may be **eventually consistent**. It's not suitable for instant cache invalidation where strong consistency is required.

---

### 💾 Storage Backends
TriFrost cache uses the same Store abstraction as rate limiting. It supports:

##### Memory
- In-memory Map
- Zero config
- Great for dev or per-instance caching
```typescript
import {MemoryCache} from '@trifrost/core';

const app = new App<Env>({
  cache: () => new MemoryCache({ttl: 60}),
});
```

##### KV (Cloudflare)
- Uses [Cloudflare KV](https://www.cloudflare.com/developer-platform/products/workers-kv/)
- Good for global availability
- **Eventual consistency**
- Slower than DO or Redis for rapid reads/writes

**Note**: Cloudflare KV is eventually consistent and significantly slower than Durable Objects under high concurrency. It's best for soft-caching or global edge, not precise enforcement.

```typescript
import {App, KVCache} from '@trifrost/core';

type Env = {
  MY_KV: KVNamespace;
};

const app = new App<Env>({
  cache: ({env}) => new KVCache({
    store: env.MY_KV,
    ttl: 180, // 3 minutes
  }),
});
```

In your `wrangler.toml`:
```bash
[[kv_namespaces]]
binding = "MY_KV"
id = "xxxxxx..."
```

> **Note**: CloudFlare KV has a minimum ttl of 1 minute (60 seconds)

##### Redis
- Traditional Redis (compatible with libs like `ioredis`)
- Great for clustered Node apps or centralized backends
- Low-latency and strongly consistent
```typescript
import {App, RedisCache} from '@trifrost/core';
import Redis from 'ioredis';

const app = new App({
  cache: ({env}) => new RedisCache({
    store: new Redis(...),
    ttl: 120, // 2 minutes
  }),
});
```

##### Durable Objects (Cloudflare)
- Uses a single [Cloudflare Durable Object](https://www.cloudflare.com/developer-platform/products/durable-objects/)
- **Sequential consistency** guarantees accuracy
- Ideal for precise or billing-related cache
- Requires manual registration and export (see below)

Compared to KV, Durable Objects offer lower latency and stronger consistency. They're ideal for precise control (e.g. billing, abuse prevention) and scale well under concurrency.

To use TriFrost's Durable Object-based cache:
```typescript
import {App, DurableObjectCache, TriFrostDurableObject} from '@trifrost/core';

type Env = {
  MainDurable: DurableObjectNamespace;
};

// Required for Workerd
export {TriFrostDurableObject};

const app = await new App<Env>({
  cache: ({env}) => new DurableObjectCache({
    store: env.MainDurable,
    ttl: 60,
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

> Workerd/Cloudflare requires DO classes to be explicitly exported and bound. If missing, caching won't work.
> 👉 Learn more in: [Workerd Deployment Guide](/docs/cloudflare-workers-workerd)

---

### 🧪 Why cache Is a Function
When configuring a cache, TriFrost expects `cache` to be a function that receives the current `{env}`.

This enables:
- Lazy initialization (e.g. when not all bindings are ready at startup)
- Runtime-specific resolution (DO/KV vary across regions or workers)
- Full access to typed `ctx.env` inside the adapter
- Ability to switch the rate limiting setup depending on the environment
```typescript
cache: ({env}) => {
  if (isDevMode(env)) return new MemoryCache({...});
  return new DurableObjectCache({store: env.MainDurable, ...});
},
```

> This ensures your cache integrates seamlessly with edge runtimes and supports async-compatible storage.

---

### Best Practices
- ✅ Use `.wrap(...)` for auto-get/set flow
- ✅ Prefer `.wrap` over `get/set` for idempotency
- ✅ Use `cacheFn(...)` or `@cache(...)` for reusable logic
- ✅ Don’t forget `.del(...)` supports **prefix invalidation**
- ✅ Durable Objects are best for precise or metered cache on Cloudflare
- ✅ Use prefix-based keys when designing your cache schema, this gives you **fine-grained control** over invalidation down the line

---

### Related
- [Dev Mode](/docs/utils-devmode)
- [Rate Limiting API](/docs/ratelimiting-api)
- [Context API](/docs/context-api)
- [Middleware Basics](/docs/middleware-basics)
- [Router & Route](/docs/router-route)

TriFrost's `ctx` object is the **per-request toolkit** that powers every handler, middleware, and internal operation. It gives you structured access to request metadata, response methods, state handling, security headers, logging, and more.

You never construct a context yourself, it's passed into every handler automatically. Behind the scenes, it adapts to the runtime (Node, Bun, Workerd, ...), and enforces immutability, safety, and traceability across the request lifecycle.

👉 See also: [Understanding Context](/docs/understanding-context) | [Context & State Management](/docs/context-state-management)

---

### 🧠 State Management
TriFrost makes request-scoped state handling **safe, ergonomic, and typesafe**. State is isolated per request and flows through middleware, handlers, and services cleanly.

**API:**
```typescript
ctx.state: Record<string, unknown>                 // Read-only snapshot
ctx.setState(patch: Record<string, unknown>): ctx  // Merge/expand state
ctx.delState(keys: string[]): ctx                  // Remove keys from state
```
```typescript
ctx.setState({ user: { id: 'abc123', role: 'admin' } });

if (ctx.state.user?.role === 'admin') {
  // Do something privileged
}

ctx.delState(['user']); // Remove user from state
```

**Best Practices:**
- ✅ Use `setState(...)` to add trusted data from upstream middleware (e.g. auth, sessions, tenants)
- ✅ `ctx.state` is always safe to read, even if empty — no undefined surprises
- ✅ Combine with TypeScript generics to get autocompletion across your pipeline:
- 🚫 Don’t mutate `ctx.state` directly, always go through `setState` or `delState` to preserve immutability guarantees

State is preserved across:
- Middleware chains
- Group routes
- Nested routers
- Inline handlers

👉 See: [Context & State Management](/docs/context-state-management)

---

### 🌐 Headers
TriFrost gives you full control over both **inbound** request headers and **outbound** response headers.

**Reading inbound headers**
```typescript
/* Set of inbound headers from the request */
ctx.headers: Readonly<Record<string, string>>
```
```typescript
const ua = ctx.headers['user-agent'];
const contentType = ctx.headers['content-type'];
```
> ✅ Inbound headers are normalized internally (**case-insensitive** as per [RFC 7230 §3.2](https://datatracker.ietf.org/doc/html/rfc7230#section-3.2)), and all values are stringified.

-----

**Setting response headers**
```typescript
ctx.setHeader(key: string, value: string | number): void
ctx.setHeaders(headers: Record<string, string | number>): void
ctx.delHeader(key: string): void
```

```typescript
ctx.setHeader('X-RateLimit-Limit', 100);
ctx.setHeaders({
  'Cache-Control': 'no-store',
  'X-Service-Version': '1.2.3',
});
ctx.delHeader('X-Debug-Token');
```

Use this to:
- Set CORS, cache, or custom metadata headers
- Forward diagnostic or tracing information
- Adjust `Content-Type` manually if needed (`ctx.setType(...)` also available)

👉 See also: [Cache Control Middleware](/docs/middleware-api-cache-control) | [Cors Middleware](/docs/middleware-api-cors) | [Security Middleware](/docs/middleware-api-security) | [Request Lifecycle](/docs/request-response-lifecycle)

---

### 📤 Responding
TriFrost gives you ergonomic shortcuts to send responses in a variety of formats. These methods automatically handle headers, status codes, and finalization via `ctx.end()`.

##### ctx.text
Respond with plain text. Sets `Content-Type: text/plain` by default.
```typescript
ctx.text('hello world');
```

You can also pass an options object:
```typescript
ctx.text('hello world', { status: 418 });
```

##### ctx.html
Respond with raw HTML or [JSX](/docs/jsx-basics). Sets `Content-Type: text/html` by default.
```typescript
ctx.html('<h1>Hello</h1>');
ctx.html(<Layout title="Welcome">...</Layout>);
```

Options:
```typescript
ctx.html('<h1>Unauthorized</h1>', {
  status: 401,
  cacheControl: 'no-store',
});
```

- Automatically handles `<!DOCTYPE html>` insertion
- Injects `nonce` for CSP compliance
- Manages `Set-Cookie` headers for hydration

> **Note**: When working with JSX, automatic nonce injection and CSP handling is included

##### ctx.json
Respond with structured JSON. Sets `Content-Type: application/json` by default.
```typescript
ctx.json({ ok: true });
```

With options:
```
ctx.json({ error: 'invalid' }, {
  status: 400,
  cacheControl: 'no-store',
});
```

##### ctx.status
Send a pure status response with no body, useful for health checks, HEAD routes, or error handling:
```typescript
ctx.status(204); // no content
```

##### ctx.file
Stream a file response, can be used for static assets, dynamic binary blobs, or integrations like S3 / R2:
```typescript
ctx.file('public/logo.png');
```
> On Workerd (Cloudflare Workers), this requires an `ASSETS` binding to be configured.

**Example: File from S3 (Node/Bun)**
```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
const Bucket = 'my-bucket';

export default async function handler(ctx) {
  const Key = ctx.query.get('key');
  if (!Key) return ctx.status(400);

  try {
    const { Body, ContentLength } = await s3.send(new GetObjectCommand({ Bucket, Key }));

    return ctx.file({
      stream: Body,
      size: ContentLength,
      name: Key,
    }, { download: true });
  } catch (err) {
    ctx.logger.error('S3 fetch failed', { err });
    ctx.status(404);
  }
}
```

**Example: File from R2 (Workerd)**
```typescript
export default async function handler(ctx) {
  const key = ctx.query.get('key');
  if (!key) return ctx.status(400);

  try {
    const res = await ctx.env.MY_BUCKET.get(key);
    if (!res?.body) return ctx.status(404);

    return ctx.file({
      stream: res.body,
      size: res.size ?? null,
      name: key,
    }, { download: true });
  } catch (err) {
    ctx.logger.error('R2 fetch failed', { err });
    ctx.status(500);
  }
}
```

> `ctx.file(...)` automatically sets `Content-Type based` on file extension (if not already set), and sets `Content-Disposition` when `{ download: true }` is passed.

Both `ctx.html`, `ctx.text`, `ctx.json` and `ctx.file` responders support as options:
```typescript
{
  status?: number,             // Optional HTTP status override
  cacheControl?: string        // Shortcut for `ctx.setHeader('Cache-Control', ...)`
}
```

👉 See: [Request Lifecycle](/docs/request-response-lifecycle) | [Middleware: Security](/docs/middleware-api-security) | [JSX Basics](/docs/jsx-basics)

---

### 🔁 Redirecting
Use ctx.redirect(...) to issue an HTTP redirect to a new location:
```typescript
ctx.redirect('/login'); // Defaults to 303 See Other
ctx.redirect('/dashboard', { status: 302, keep_query: false });
```

Behavior:
- Relative URLs are automatically resolved against the current host
- Query strings are preserved by default (`keep_query: true`)
- The default status is **303 See Other** as per ([RFC 7231](https://www.rfc-editor.org/rfc/rfc7231))
- Automatically sets the `Location` header and finalizes the response

**Example: Redirect preserving query string**
```typescript
// Request: /redirect-me?foo=bar
ctx.redirect('/target');
// → Location: /target?foo=bar
```

**Example: Redirect to external URL**
```typescript
ctx.redirect('https://example.com/logout');
```

**Example: Internal computed redirect**
```typescript
const next = ctx.query.get('next') ?? '/dashboard';
ctx.redirect(next, { status: 302 });
```

> For relative paths like `login` (no slash), TriFrost will resolve it to a fully-qualified URL based on the host — even on edge runtimes.

👉 See: [Request Lifecycle](/docs/request-response-lifecycle) | [Routing Basics](/docs/routing-basics)

---

### 📎 Metadata
TriFrost exposes useful metadata via typed getters, all available directly on the context. These values are read-only and runtime-safe — and most of them are lazily computed.

**Request & Context Metadata**
```typescript
ctx.body        // Parsed request body (if applicable)
ctx.domain      // Domain derived from host (if determinable)
ctx.env         // The environment passed at app boot
ctx.headers     // Inbound request headers
ctx.host        // Host of the request (respects trusted proxy config)
ctx.ip          // Caller IP address (if able to determine)
ctx.kind        // Purpose of the context: 'std', 'health', 'notfound', or 'options'
ctx.method      // HTTP method (e.g. 'GET', 'POST')
ctx.name        // Name of the matched route
ctx.path        // Request path (e.g. '/login')
ctx.query       // URLSearchParams instance for query params
ctx.requestId   // Inbound request ID or generated fallback
ctx.state       // The current request-scoped state object
ctx.statusCode  // Current response status code (mutable via `setStatus`)
ctx.timeout     // Currently configured timeout value (if any)
```

**Boolean flags**
```typescript
ctx.isAborted     // True if the context was aborted early via `abort()`
ctx.isDone        // True if the response was finalized via `end()`
ctx.isInitialized // True if context was successfully initialized (body parsed)
ctx.isLocked      // True if the response can no longer be mutated (`isAborted || isDone`)
```

##### ctx.kind
The `kind` tells you what “role” the context is playing. This is **mostly useful in middleware, logging, or introspection** use cases:
- `'std'`: A regular route (default)
- `'notfound'`: A context triggered for an unmatched route
- `'health'`: A lightweight healthcheck (e.g. for readiness probes)
- `'options'`: An OPTIONS request used for CORS or handshake fallback

> With exception of `'health'` the kind is **automatically set by the router**, based on route config.

**Defining a health route:**
```typescript
app.get('/health', {
  kind: 'health',
  name: 'Healthcheck',
  handler: async (ctx) => {
    ctx.text('ok');
  }
});
```
This marks the route as `ctx.kind === 'health'`, which:
- **Auto-excludes** the route from tracing or logs
- Lets infra probes identify lightweight pings
- Skips non-essential middleware in some setups
- **Skips rate limits**

👉 See: [Routing Basics](/docs/routing-basics) | [Request Lifecycle](/docs/request-response-lifecycle)

---

### ⏱️ Timeout Management
TriFrost automatically enforces a **30 second timeout per request** (default configurable via [App](/docs/app-class)). If the timeout is reached, the request is **aborted automatically** and a **408 Request Timeout** response is returned.

You can override this globally (**App**), on a route group, per route, or per request.

**Per-request Example**
```typescript
ctx.setTimeout(5000); // Abort if not complete in 5s

const res = await ctx.fetch('https://api.example.com/data');
const json = await res.json();

ctx.json(json);
```

-----

**Define Timeout via Route Object**
This will override the default and apply a 10s timeout only for this route.
```typescript
app.get('/slow', {
  name: 'SlowEndpoint',
  timeout: 10000, // 10 seconds
  handler: async (ctx) => {
    await sleep(8000);
    ctx.text('done');
  }
});
```

-----

**Define Timeout on a Route Group**
You can also apply timeouts to entire route groups:
```typescript
router.group('/api', {
  timeout: 5000, // 5s for all /api/* routes
  fn: (groupRouter) => {
    groupRouter.get('/users', async (ctx) => {
      const users = await fetchUsers();
      ctx.json(users);
    });

    groupRouter.get('/posts', async (ctx) => {
      const posts = await fetchPosts();
      ctx.json(posts);
    });
  },
});
```

All routes inside the group will inherit this timeout unless individually overridden.

-----

> TriFrost applies timeouts at the context level — they cover all async activity unless explicitly disabled with `ctx.clearTimeout()`.

When to use
- Long-polling endpoints or streaming APIs
- Third-party integrations with unpredictable latency
- Experimental features or unsafe computations
- Preventing resource hangs during traffic spikes

👉 See: [Request Lifecycle](/docs/request-response-lifecycle) | [App Class](/docs/app-class) | [Routing Basics](/docs/routing-basics)

---

### 🧪 Logging
Every context includes a structured, trace-aware logger available via `ctx.logger`. It’s runtime-safe, span-capable, and automatically scoped to the current request.
```typescript
ctx.logger.debug(message, data?)
ctx.logger.info(message, data?)
ctx.logger.warn(message, data?)
ctx.logger.error(error, data?)
ctx.logger.span(name, fn)
ctx.logger.setAttribute(key, value)
ctx.logger.setAttributes(record)
```
- Trace ID is auto-injected on every log
- All logs and spans are flushed after the request ends
- All middleware is already traced, no need to wrap it

**Logging:**
Use `.info`, `.debug`, `.warn`, and `.error` to write structured logs. Errors include stack traces automatically.
```typescript
ctx.logger.info('User logged in', { userId: ctx.state.user.id });
ctx.logger.error(err, { action: 'loadProfile' });
```

-----

**Spans:**
Spans track the duration and context of specific operations, like DB queries or API calls.
```typescript
await ctx.logger.span('loadUser', async () => {
  const user = await db.findById(ctx.state.userId);
  ctx.setState({ user });
});
```

> You can also use decorators or `spanFn()` for method-level tracing.

-----

**Attributes:**
Add persistent attributes to the logger. These are attached to all logs and spans created after the call.
```typescript
ctx.logger.setAttributes({
  userId: ctx.state.user.id,
  tenantId: ctx.state.tenant?.id,
});
```

-----

✅ Best Practices:
- Use `.setAttributes()` early to enrich downstream spans. (**trifrost includes several already such as method, path, host, etc**, make use of **your ecosystem's identifiers such as user ids**).
- Use `.span()` around I/O, network, DB calls, **not synchronous logic**
- Don’t manually flush — TriFrost does this for you

👉 See: [Logging & Observability](/docs/logging-observability) | [Logger API](/docs/logger-api)

---

### 🔒 Nonce & CSP
Each context gets a `ctx.nonce` used for:
- Inline scripts in SSR responses
- CSP header compliance
- Safe hydration across fragments

You can use it manually but in practice `ctx.html(...)` will do it automatically if using JSX.

👉 See: [Middleware: Security](/docs/middleware-api-security)

---

### 🍪 Cookies
Use `ctx.cookies` to manage cookies cleanly across runtimes, with support for signing, deletion, and audit-friendly introspection.
```typescript
ctx.cookies.get(name)                         // Read a cookie
ctx.cookies.set(name, value, options?)        // Set a cookie
ctx.cookies.del(name, options?)               // Delete a cookie
ctx.cookies.del({ prefix }, options?)         // Delete cookies by prefix
ctx.cookies.delAll(options?)                  // Clear all cookies
ctx.cookies.all()                             // Return full cookie map
```

**Signing & Verifying:**
Use HMAC-based signing to ensure a cookie hasn’t been tampered with. This is especially useful for session tokens, user IDs, or security-critical data.
```typescript
await ctx.cookies.sign(value, secret, options?)
await ctx.cookies.verify(signed, secretOrSecrets, options?)
```

👉 See: [Cookies API](/docs/cookies-api) for details on expiration, signing options, and runtime behavior.

---

### 🧊 Caching
The cache layer is available via `ctx.cache` if configured. It supports storing primitives, JSON-like structures, and integrates TTL, prefix deletion, as well as lazy evaluation.
```typescript
ctx.cache.get(key)                                  // Retrieve a cached value
ctx.cache.set(key, value, {ttl})                    // Store a value with optional TTL (in seconds)
ctx.cache.del(key)                                  // Delete by key
ctx.cache.del({ prefix: 'user:' })                  // Delete all keys with a prefix
ctx.cache.wrap(key, computeFn, {ttl})               // Compute + cache combo
```

**wrap(...) Lazy caching helper:**
```typescript
const profile = await ctx.cache.wrap(`user:${id}`, async () => {
  return await db.loadUser(id);
}, { ttl: 3600 });
```
- Skips re-computation if the key exists
- Only caches non-undefined values
- Supports structured return values, including falsy (false, 0, etc)

> You can also use `cacheSkip()` inside your compute function to opt-out of storing specific results (see [Cache API](/docs/cache-api) for details)

-----

TriFrost defaults to an in-memory `MemoryCache` store unless a custom store is provided via [App](/docs/app-class). Fully supports custom adapters (KV, Redis, DurableObjects, etc).

> You can also use decorators or cacheFn() for method-level caching.

👉 See: [Cache API](/docs/cache-api) for TTL behavior, adapter setup, and cacheSkip utility.

---

### 🛠️ Lifecycle & Hooks
TriFrost gives you fine-grained control over the response lifecycle and finalization process. While most use cases are covered by high-level methods like `ctx.text` or `ctx.json`, the low-level lifecycle tools give you escape hatches for edge cases or advanced flows.
```typescript
ctx.setBody(body: string | null): void
ctx.setStatus(status: number): void
ctx.setType(mime: MimeType): void
ctx.render(body: JSX.Element, opts?): string

ctx.abort(status = 503): void
ctx.end(): void
ctx.addAfter(fn: () => Promise<void>): void
```

**setBody/setStatus/setType:**
These let you construct a response manually:
```typescript
ctx.setStatus(200);
ctx.setType('application/json');
ctx.setBody(JSON.stringify({ ok: true }));
ctx.end();
```

This is also what high-level methods like `ctx.json()` call under the hood.

✅ `ctx.setStatus(...)` is particularly important for middleware and fallback handlers like [onError or onNotFound](/docs/error-notfound-handlers) where you want to return a specific status without forcibly aborting the request.

In the below example we're not closing off the response but letting the [lifecycle](/docs/request-response-lifecycle) handle triaging what happens, for example the nearest onNotFound handler (or if a non-404 status the nearest onError handler). **powerful stuff**.

```typescript
export async function myHandler (ctx:Context) {
	if (!ctx.state.user) return ctx.setStatus(404);

	...
}
```

-----

**render(...):**
Renders a JSX tree into a raw HTML string. This is used internally by `ctx.html()`, but can be used manually when you need **more control**, for example, **rendering non-client-bound HTML like transactional emails**.
```typescript
const html = ctx.render(<Page {...data} />);
ctx.setType('text/html');
ctx.setBody(html);
ctx.end();
```
Use this if you need to:
- Inspect or mutate the HTML before sending it
- Combine with manual `setHeader` or `setStatus`
- Compose fragments outside of full responders
- Generate non-interactive HTML (e.g. **emails**, PDF pipelines, AMP views)

You can also pass `opts` to override config like the css instance to use:
```typescript
const myCustomCSS = createCss({...});

ctx.render(<MarketingCampaign />, { css: myCustomCSS });
```

> Automatically handles nonce injection, config propagation, and environment hydration.

👉 See: [JSX Basics](/docs/jsx-basics)

-----

**abort(status?: number):**
**Immediately terminates the request**, useful for early exits or error handling. Use this **when something is fatally wrong and no response should be sent** (or only a minimal fallback). After this, no changes to the response body, status, or headers are allowed.
```typescript
if (!ctx.state.user) {
  return ctx.abort(401);
}
```

- It **short-circuits the pipeline**
- It clears any response body
- Sets a status (defaults to `503` if not provided)
- does **not** fallback to [triaging](/docs/request-response-lifecycle)

Prefer `abort()` when:
- You’re inside timeouts or critical error branches
- You want to prevent any further handlers from executing
- **In any other case** prefer using `return ctx.setStatus(...)`

-----

**end():**
Marks the request as complete. After this, no further mutations are allowed.
```typescript
ctx.end(); // Explicit end, if you built the response manually
```

This is called automatically by all built-in responders (`ctx.json`, `ctx.html`, etc), but useful when doing manual response construction.

-----

**addAfter(fn):**
Registers a post-response hook that runs after the response is sent — but before the runtime exits.
```typescript
ctx.addAfter(async () => {
  await analytics.track(ctx.state.user);
});
```

- On **Node/Bun**: uses `queueMicrotask(...)`
- On **Workerd**: uses `ctx.executionContext.waitUntil(...)`

Perfect for:
- Logging
- Background queueing
- Tracing + cleanup
- Session or audit hooks

> **Note**: Internal log flushes also uses this.

-----

👉 See: [Request Lifecycle](/docs/request-response-lifecycle) | [Error & 404 Handling](/docs/error-notfound-handlers)

---

### 🌍 External Fetch
TriFrost exposes a wrapped `fetch()` on the context object that **adds observability and propagation features automatically**:
```typescript
await ctx.fetch(url, init?)
```

✅ What it does:
- Automatically wraps the request in a **span** for tracing
- Adds the current request's **trace ID** to outbound headers (if configured)
- Logs duration, errors, and metadata (method, URL, status)
- Respects timeouts set via `ctx.setTimeout(...)`
- Behaves identically across **Node**, **Bun**, and **Workerd**

**Basic Usage:**
```typescript
const res = await ctx.fetch('https://auth.internal/user', {
  method: 'POST',
  headers: { Authorization: `Bearer ${ctx.env.AUTH_TOKEN}` },
  body: JSON.stringify({ session: ctx.cookies.get('session_id') })
});

if (!res.ok) {
  ctx.logger.error('Failed to load user', { status: res.status });
  return ctx.status(502);
}

const user = await res.json();

return ctx.json({ data: user });
```

This will:
- Start a span like `fetch GET https://api.example.com/data`
- Record its duration + response code
- Attach the trace ID via `x-request-id` (or whichever [outbound header](/docs/app-class) you've set in your config)

-----

**How trace ID propagation works:**
If your [app](/docs/app-class) is configured with `tracing.requestId.outbound` (by default it is), TriFrost will:
```typescript
// Pseudocode
headers.set(config.outbound, ctx.logger.traceId);
```

This allows downstream systems (like services or workers) to **receive and propagate trace IDs, essential for end-to-end observability in distributed systems**.

-----

👉 See also: [Logging & Observability](/docs/logging-observability) | [Logger API](/docs/logger-api) | [Request & Response Lifecycle](/docs/request-response-lifecycle)

---

### Best Practices

Keep these principles in mind when working with the TriFrost ctx object:
**State**
- Use `ctx.setState(...)` to pass trusted data (user, auth, tenant, etc.) between middleware and handlers
- Prefer narrow, typed state definitions for safety (`Context<Env, State>`)
- Never mutate `ctx.state` directly, always go through `setState` or `delState`

**Responding**
- Use `ctx.text`, `ctx.json`, `ctx.html`, `ctx.status` for 99% of cases, they're fast, safe, and auto-finalize
- For advanced needs, compose manually using `setStatus`, `setHeader`, `setBody`, `setType` and `end`
- Always use `ctx.file(...)` for binary or streamed responses, don’t build headers manually

**Redirects**
- Use relative paths when possible, TriFrost will resolve them safely
- Set `{ keep_query: false }` if you need a clean redirect
- Always provide a full URL or host-aware path for external targets

**Headers**
- Inbound header keys are case-insensitive
- Use `ctx.setType(...)` instead of raw `Content-Type` when setting known MIME types
- Avoid setting headers after `ctx.end()` or `ctx.abort()`, they’ll be ignored

**Timeouts**
- Use `ctx.setTimeout(ms)` to guard third-party APIs or long-polling routes
- Use `ctx.clearTimeout()` for streams or routes that you know won’t hang
- Prefer setting timeouts per route/group instead of globally disabling

**Logging**
- Add `ctx.logger.setAttributes(...)` early to enrich downstream logs and spans
- Use `ctx.logger.span(...)` around DB, fetch, or expensive ops
- Never call `ctx.logger.flush()` — TriFrost does this automatically

**Lifecycle**
- Prefer `ctx.setStatus(...)` over `ctx.abort(...)` in most cases, it allows **lifecycle triaging**
- Use `ctx.abort()` only when a fatal short-circuit is required
- Register hooks with `ctx.addAfter(...)` to handle logging, audit trails, or background jobs

**Security**
- Let `ctx.html(...)` handle nonce and CSP — it’s baked in and spec-compliant
- Use `ctx.nonce` manually only when working outside of JSX

**Caching**
- Use `ctx.cache.wrap(...)` to reduce boilerplate and avoid cache misses
- Always define a TTL unless the value should persist indefinitely
- Use `{ prefix: ... }` deletes to clean up stale buckets (e.g. `user:` or `view:`)

> Think of the context as your **trusted execution surface**, everything that happens inside a request flows through it. Keep it pure, consistent, and observable.

---

### 📦 Related
- [App Class](/docs/app-class)
- [Router & Route](/docs/router-route)
- [Routing Basics](/docs/routing-basics)
- [Middleware Basics](/docs/middleware-basics)
- [Logger API](/docs/logger-api)
- [Cookies API](/docs/cookies-api)
- [Cache API](/docs/cache-api)
- [Context & State Management](/docs/context-state-management)
- [JSX Basics](/docs/jsx-basics)
- [Request & Response Lifecycle](/docs/request-response-lifecycle)

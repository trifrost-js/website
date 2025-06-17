Every request that flows through a TriFrost app follows a **clear, deterministic path** — no magic layers, no nested traps, no ambiguity.

Whether it’s a simple `GET /hello` or a complex multi-middleware route chain, the lifecycle is always transparent, type-safe, and under your control.

---

### 🧭 Lifecycle at a Glance
```txt
┌───────┐
│  Request   │
└─┬─────┘
     ▼
🔗 App-level middleware
     ▼
📂 Router + Subrouter logic
     ▼
🔗 Route-level middleware
     ▼
⚙️  Route handler
     ▼
🎯 Response sent
     ▼
🌀 After hooks (post-response execution)
```

##### 1. Incoming Request
Each runtime has their own `Context` abstraction tailored to their runtime.

When a request enters the system TriFrost immediately:
- Wraps it into the runtime-specific `Context` object
- Spawns a logger instance

##### 2. Route Matching
Great we have a context & logger object, but we don't know what it belongs to yet.

The second thing TriFrost will do is match the request path against our defined routes.

If no match is found it falls back to the nearest **onNotFound** handler. (Learn more about this in [Error & 404 Handlers](/docs/error-notfound-handlers)).

If *that* also fails, TriFrost returns a plain `404 Not Found` (something is better than nothing 🤷‍♂️).

This allows precise layering: global fallback behavior at the app level, and fine-tuned overrides per route group.

##### 3. Initialize
Once a route match is found, TriFrost:
- Patches the logger with route-specific metadata (like path, method, route ID)
- Automatically **parses the body** for `POST`, `PUT`, `PATCH` requests into a nice readable body (available at `ctx.body`).
- Starts an **internal timeout timer** (defaults to `30s`) to enforce lifecycle duration limits

This prepares the context for consistent downstream processing.

##### 4. Run middleware
TriFrost then executes the full middleware chain for this request.

**Each middleware is span-wrapped**, enabling full tracing without extra config. (Learn more about [logging & observability](/docs/logging-observability))

**After each middleware**, TriFrost performs a **triage check**:
- Has the response been sent?
- Was a `setStatus()` ≥ 400 called?
- Did `ctx.abort()` run?
- If yes → exit chain and if necessary jump to appropriate handler (`onError` or `onNotFound`)

This guarantees **short-circuiting is respected** and the chain stops immediately once a terminal action happens.

Middleware can **extend** `ctx.state` using `ctx.setState({...})`, and this **updated state flows through to downstream middleware and handlers** — **fully typed**.

👉 Learn how to craft middleware [middleware basics](/docs/middleware-basics)

##### 5. Handler Execution
Prime time!

If all middleware completes, the actual route handler is run.

This is where your app logic happens:
- Querying databases
- Returning data
- Handling dynamic input
- Applying business logic

Handlers can also schedule after hooks:
```typescript
ctx.after(() => sendToAnalytics(...));
```

These hooks will run **after** the response has been sent to the client.

##### 6. Cleanup & Flush
Once **a response is sent**:
- Final metrics and spans are finalized
- The logger automatically flushes any remaining buffered output

If **no response was sent**, TriFrost:
- Checks `ctx.statusCode`; if it's ≥ 400 with no body, it triggers the nearest `onError()`
- If no status was set at all, it defaults to `500 Internal Server Error` and calls `onError()` with a generic message

This ensures the request always ends with a complete and well-formed response — even if the handler forgot to return anything.

> If a **timeout** was set, it is also cleared at this point.

##### 7. After hooks
Any callbacks registered via ctx.after(...) are now executed, **post-response**.
- In **Node, Bun, and uWS**, these run as microtasks (`queueMicrotask()`).
- In Cloudflare Workerd, they’re passed to `waitUntil()` for guaranteed background execution.

These hooks:
- **Don’t impact response time**
- Can safely throw as they dont affect the client
- Are great for analytics, job queues, async processing, etc.

---

### 🚨 Fallback Handlers
If no route matches, or a handler/middleware ends in failure:
- TriFrost calls `onNotFound()` if the path didn’t match
- TriFrost calls `onError()` if a status ≥ 400 is set without a response, or if an exception is thrown

These handlers can be defined at the app or router level — and the closest one wins.

👉 Read more in [Error & 404 Handlers](/docs/error-notfound-handlers).

---

### 🧠 What Makes This Different?
TriFrost’s lifecycle is:
- 🔁 **Linear, not recursive** — no next(), no onion stack
- ⚡ **Async-safe** — designed to avoid trapdoors and lost errors
- 🧩 **Compositional** — each layer (app, router, route) is opt-in
- 💡 **Typed** — context, state, and middleware chains are type-safe and extend on each other

This gives you the power to reason about request flow — even in large apps.

---

### TLDR
- Middleware executes top-down: app → router → route
- Short-circuiting stops execution immediately
- Handlers are where main logic lives
- After hooks (`ctx.after`) run post-response for background jobs
- Fallback handlers (`onNotFound`, `onError`) catch any holes

---

### Next Steps
- Learn how to craft middleware in [Middleware Basics](/docs/middleware-basics)
- Dive into [Context & State Management](/docs/)
- Customize [Error Handling](/docs/error-notfound-handlers)

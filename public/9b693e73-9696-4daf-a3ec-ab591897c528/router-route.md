TriFrost's `Router` and `Route` systems are composable, fully-typed, and deeply integrated with middleware, context, and observability.

If you're coming from Express, Fastify, or Hono, you'll feel right at home, and TriFrost adds:
- Type-safe param extraction
- Route-scoped timeouts, middleware, and rate limits
- Lifecycle hooks like onNotFound and onError
- Route metadata for introspection and tracing

> Every `App` **is a Router**, no need to mount them separately.

👉 See also: [App Class](/docs/app-class) | [Context Api](/docs/context-api) | [Routing Basics](/docs/routing-basics) | [Error & NotFound handlers](/docs/error-notfound-handlers)

---

### 🧰 Methods Overview
Every `Router` (and `App`, since it extends `Router`) exposes the following methods:
- `.get(path, ...)`: Register a `GET` route
- `.post(path, ...)`: Register a `POST` route
- `.put(path, ...)`:Register a `PUT` route
- `.patch(path, ...)`: Register a `PATCH` route
- `.del(path, ...)`: Register a `DELETE` route
- `.group(path, ...)`: Create a nested router with shared config/middleware
- `.route(path, fn)`: Define multiple verbs for a single path (`GET`, `POST`, ...)
- `.use(fn)`: Attach middleware to all matching routes
- `.limit(n)`: Apply rate limit to the router or group
- `.bodyParser(...)`: Override body parsing behavior for this branch
- `.onNotFound(...)`: Custom handler when no route matches
- `.onError(...)`: Custom handler for errors or 4xx/5xx fallback
- `.health(path, fn)`: Register a GET route with `kind: 'health'`

> All routes and groups support **typed state inheritance**, scoped middleware, and metadata like `name`, `description`, `timeout`, and `kind`.

##### OPTIONS & HEAD
- `get(...)` automatically registers a `HEAD` route too.
- `OPTIONS` routes are **auto-generated** for all paths with multiple methods (e.g. `GET`, `POST`, etc).
- If [CORS middleware](/docs/middleware-api-cors) is detected, it’s auto-injected into the `OPTIONS` handler.

---

### Declaring Routes
TriFrost supports all standard HTTP methods as router methods:
```typescript
app
  .get('/hello', (ctx) => ctx.text('Hi there!'));
  .post('/form', async (ctx) => {
    const data = ctx.body;
    return ctx.json(data);
  });
```

Each method corresponds to a verb: `get`, `post`, `put`, `patch`, `del`.

You can also define routes with the object form:
```typescript
app.get('/account/:id', {
  name: 'AccountView',
  description: 'Account view endpoint, renders the accounts',
  timeout: 5000,
  fn: async (ctx) => {
    const { id } = ctx.state;
    return ctx.json({ id });
  },
});
```

> The object form is required when using `name`, `description`, `timeout`, or other metadata.
> `name` in particular gets used in otel traces to give a more human-friendly name to your handler.

---

### 🔢 Path Parameters
Dynamic segments use `:` notation and are automatically added to `ctx.state`, fully typed:
```typescript
app.get('/users/:userId/posts/:postId', (ctx) => {
  const { userId, postId } = ctx.state;
  return ctx.json({ userId, postId });
});
```

Wildcards are supported via `*` and are available as `ctx.state['*']`:
```typescript
app.get('/docs/*', (ctx) => {
  const path = ctx.state['*']; // e.g. "guide/setup"
  return ctx.text(`Requested: ${path}`);
});
```

> Wildcard (`*`) needs to be the last part of your path.

---

### 🧱 Grouping Routes
Group multiple routes under a common prefix and shared config:
```typescript
app.group('/api', (r) => {
  r
    .get('/users', ctx => ctx.text('Users'))
    .get('/posts', ctx => ctx.text('Posts'));
});
```

To attach group-level options (like timeout), use the object form:
```typescript
app.group('/api', {
  timeout: 5000,
  fn: (r) => {
    r.get('/ping', ctx => ctx.text('pong'));
  },
});
```

All nested routes inherit the group’s settings unless overridden.

---

### 🧱 Middleware & State
All routes and groups support `.use(...)` middleware:
```typescript
app.group('/admin/:userId', (r) => {
  r
    .use(async (ctx) => {
      const user = await fetchUser(ctx.state.userId);
      if (!user) return ctx.setStatus(404);
      return ctx.setState({ user });
    })
    .get('/dashboard', (ctx) => {
      return ctx.text(`Welcome ${ctx.state.user.name}`);
    });
});
```

Each middleware can expand `ctx.state`, and downstream handlers will inherit the updated type.

##### Middleware Execution Order
Middleware runs **top-down**, and is collected in the following order:
- `.use(...)` attached on parent router(s)
- `.use(...)` inside `.route(...)` builder
- `.middleware[]` in the route object (if provided)
- The handler itself

> You can attach as many `.use(...)` chains as you want — each one extends `ctx.state` immutably.

👉 See [Middleware Basics](/docs/middleware-basics) and [Context & State Management](/docs/context-state-management) for more.

---

### 🚥 Rate Limiting Per Route
Rate limiting can be applied:
- Globally via `app.limit(...)`
- Per group via `router.limit(...)`
- Per route via `route.limit(...)`

```typescript
app
  .limit(100) // Global
  .group('/api', (r) => {
    r
      .limit(50) // Group
      .get('/posts', ctx => ctx.text('Rate-limited'));

    r.route('/users', (route) => {
      route
        .limit(10) // Per route
        .get(ctx => ctx.text('user get'))
        .post(ctx => ctx.text('user create'));
    });
  });
```

Limits are enforced per runtime and adapter — Redis, Memory, DO, etc.

👉 See: [Rate Limiting API](/docs/ratelimiting-api)

---

### 🛑 Not Found & Error Handlers
Catch-all handlers can be attached per router:
```typescript
app
  .get('/user/:id', ctx => ctx.text(ctx.state.id))
  .onNotFound(ctx => ctx.text('404 Not Found'))
  .onError(ctx => ctx.status(500));
```
- `.onNotFound(...)`: runs when no matching route is found
- `.onError(...)`: runs on uncaught exceptions or unfinalized 4xx/5xx responses

You can also `.setStatus(...)` in a route to let TriFrost triage which handler should be used (e.g. `onNotFound` vs `onError`).

---

### 🧬 Route Metadata
Each route can include metadata:
- `name`: for logging, tracing, and debugging
- `description`: optional description for the route
- `kind`: one of `'std' | 'health' | 'notfound' | 'options'`
- `timeout`: overrides global timeout
- `fn`: the actual logic

> **Take Note:** At time of writing the `description` prop is not in use across the ecosystem. Towards the future this might become part of the ecosystem with regards to automatic documentation generation.
> If `name` is omitted:\n- We'll try to infer it from the handler function's name (if named).\n- Otherwise, a fallback like `"GET_/profile/:id"` is generated.

##### Health Routes
Health routes (`kind: 'health'`) are:
- Excluded from rate limiting
- Excluded from tracing/logging
- Marked as `ctx.kind === 'health'`

```typescript
app.health('/status', (ctx) => ctx.text('ok'));
```

> `app.health(...)` and `router.health(...)` are shortcuts for this.

---

### 🧩 Composite .route(...)
Sometimes you want to define multiple handlers for the same path:
```typescript
app.route('/session', (route) => {
  route
    .post(ctx => ctx.text('Create session'))
    .del(ctx => ctx.text('Delete session'));
});
```

This is perfect for grouping verbs under a common resource path.

They can also have their own middleware/limit/...:
```typescript
app.route('/session', (route) => {
  route
    .use(...)
	.use(...)
	.limit(...)
    .post(ctx => ctx.text('Create session'))
    .del(ctx => ctx.text('Delete session'));
});
```

---

### 🔍 Per-Route Body Parsing
You can override the body parser for:
- A whole router (via `.bodyParser(...)`)
- A single route (via object form)

Example:
```ts
app.bodyParser({type: 'json'}); // global fallback

app.post('/upload', {
  bodyParser: {type: 'stream'},
  fn: async (ctx) => {
    const stream = ctx.body;
    ...
  }
});
```

This gives you precise control over how body parsing behaves, useful for binary uploads, streaming, or custom types.

---

### 🔐 Advanced Typing
TriFrost supports full type inference out of the box, but in larger codebases it's helpful to **lock in types globally** for consistency.

You can define shared environment and context types like this:
```typescript
// types.ts
import type {TriFrostContext, TriFrostRouter} from '@trifrost/core';

// Define your runtime-provided Env shape
export type Env = {
  Bindings: { DB: D1Database };
  Variables: { version: string };
};

// Typed context with a base state
export type Ctx<S = {}> = TriFrostContext<Env, S>;

// Typed router helper
export type Router<S = {}> = TriFrostRouter<Env, S>;
```

Use those helpers across route modules:
```typescript
// routes/user.ts
import type {Router, Ctx} from '~/types';

export function userRoutes <S extends {...}> (r: Router<S>) {
  r.get('/me', (ctx: Ctx) => {
    return ctx.json({ version: ctx.env.Variables.version });
  });
};
```

This gives you:
- ✅ Typed `ctx.env`, `ctx.state`, etc.
- ✅ Inferred `.use(...)` middleware with automatic state merging
- ✅ Shared types across routes, middleware, and handlers

👉 Read more in: [App Class](/docs/app-class) | [Routing Basics](/docs/routing-basics) | [Context & State Management](/docs/context-state-management) | [Context API](/docs/context-api)

---

### Best Practices
- ✅ Use `.group(...)` to organize routes by domain or version (`/api/v1`, `/admin`, etc.)
- ✅ Prefer the object route form when setting metadata like `name`, `timeout`, `kind`, `description`
- ✅ Use `.route(...)` for verb-grouped endpoints (`GET/POST/PUT`) on the same path
- ✅ Attach middleware with `.use(...)` early to propagate typed state
- ✅ Use `.onNotFound(...)` and `.onError(...)` for clear fallback behavior
- ✅ Declare `health` routes using `.health(...)` or `kind: 'health'` to enable probe-safe endpoints

---

### Related
- [Routing Basics](/docs/routing-basics)
- [App Class](/docs/app-class)
- [Context API](/docs/context-api)
- [Context & State Management](/docs/context-state-management)
- [Middleware Basics](/docs/middleware-basics)
- [Rate Limiting API](/docs/ratelimiting-api)
- [Request Lifecycle](/docs/request-response-lifecycle)
- [Error & NotFound handlers](/docs/error-notfound-handlers)

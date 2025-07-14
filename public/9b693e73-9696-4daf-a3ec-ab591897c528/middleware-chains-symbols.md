In TriFrost, middleware is a **first-class, typed, and deterministic execution model**.

Unlike most frameworks, **TriFrost does not use the onion model**. There is **no** `next()`, no wrapping, no “before/after” dance.

Instead, it uses a **linear, top-down chain**:
- Each middleware runs in order
- If it returns a response → the chain **stops**
- Otherwise → the next handler runs
- Middleware is automatically [span-wrapped](/docs/logging-observability)

This makes reasoning about execution **clear, predictable, composable** as well as **observable**.

---

### Key Principles
- **No** `next()`: middleware is not a stack
- **Linear execution**: top-to-bottom, no recursion
- **Short-circuiting**: middleware can stop the chain
- **Typed** `ctx.state`: middleware can safely extend context
- **Scoped chains**: middleware can be attached at any level: app, group, or route

---

### 📚 What is Middleware?
It’s just a function:
```typescript
(ctx) => {
  if (!ctx.headers.get('x-api-key')) {
    return ctx.text('Forbidden', 403);
  }
}
```

If it returns `undefined` or the `ctx`, the chain continues.

If it returns a **response, sets a 400+ status**, or calls `ctx.abort()`, execution halts immediately.

---

### 🧬 Expanding State
If you want to pass data down the chain (like a user or session), use `ctx.setState(...)`.

> This is **required** to propagate new types into `ctx.state`.
```typescript
const requireUser = async <State extends Record<string, unknown>>(ctx: Context<State>) => {
  const user = await getUserFromToken(ctx);
  if (!user) return ctx.status(401);

  return ctx.setState({ user });
};
```

Now all downstream middleware and routes know `ctx.state.user` is defined, **and typed**.

👉 Also see: [Context & State Management](/docs/context-state-management) | [Middleware Basics](/docs/middleware-basics)

##### Manual Typing (Advanced)
If you must call `ctx.setState(...)` somewhere in the middle and can’t return it (e.g., logging after setting), you can annotate the return manually:
```typescript
async function m <S extends Record<string, unknown>> (
	ctx: Context<S>
): Promise<Context<S & {foo: string}>> {
  ctx.setState({foo: 'bar'});
  ...
  return ctx;
};
```

> But whenever possible `return ctx.setState(...)` is the **cleanest and most type-safe way**.

---

### 🔐 Typing the Chain
Each middleware explicitly defines what it **requires** and what it **adds**:
```typescript
const auth <State>(ctx: Context<State>) => {
  const user = ...;
  return ctx.setState({ user });
};

const onlyAdmins <State extends {user: User}>(ctx: Context<State>) => {
  if (ctx.state.user.role !== 'admin') {
    return ctx.status(403);
  }
};
```

If you add `onlyAdmins()` without `auth()` before it in your chain, **TypeScript will yell at you**.

✅ Type safety isn't optional — it’s **baked into the chain**.

👉 Also see: [Context & State Management](/docs/context-state-management) | [Middleware Basics](/docs/middleware-basics)

---

### 🔗 Composing Chains
You can attach middleware:
- To the **app**
- To a **router or group**
- To a **single route**

They **stack in order**:
```typescript
app
  .use(auth)         // adds ctx.state.user
  .use(onlyAdmins)   // requires ctx.state.user
  .get('/admin', ctx => ctx.json(ctx.state.user));
```

```typescript
app
  .get('/home', ctx => ctx.text('hello world')) // no middleware here
  .use(auth)         // adds ctx.state.user
  .use(onlyAdmins)   // requires ctx.state.user
  .get('/admin', ctx => ctx.json(ctx.state.user));
```

This is deterministic. There’s **no “before/after” guesswork**.

---

### 🛑 Halting the Chain
Any middleware can short-circuit the chain by:
- Returning a response through eg: `ctx.text()`, `ctx.json()`, `ctx.status()`, etc.
- Calling `ctx.abort()` if in dire need
- Returning a status >= 400 using `return ctx.setStatus(...)`

Once any of these happen, downstream handlers **won’t run**.

```typescript
const blockUnauthenticated = (ctx) => {
  if (!ctx.state.user) return ctx.setStatus(401);
};
```

---

### 🧱 Example: Scoping
```typescript
app
  .use(cors()) // all routes
  .group('/admin', admin => {
    admin
      .use(requireUser)
      .use(onlyAdmins)
      .get('/dashboard', ctx => ctx.text('welcome admin'));
  });
```
- `cors()` applies to everything
- `/admin/dashboard` runs `cors → requireUser → onlyAdmins → handler`
- Outside `/admin`, those checks are skipped

---

### ⚒️ Built-In Middleware
TriFrost includes a powerful set of built-ins, just `.use()` them:

- ✅ [Cors()](/docs/middleware-api-cors): configure CORS headers
- ✅ [Security()](/docs/middleware-api-security): set secure HTTP headers (HelmetJS-style)
- ✅ [CacheControl()](/docs/middleware-api-cache-control): apply cache policy
- ✅ [RateLimit()](/docs/ratelimiting-api): per-IP/per-key limiters using `.limit(...)`
- ✅ [SessionCookieAuth()](/docs/middleware-api-auth): signed session cookie auth
- ✅ [BearerAuth()](/docs/middleware-api-auth)/[ApiKeyAuth()](/docs/middleware-api-auth): for APIs, services, ...

All of them follow the same model: **deterministic, typed, halt-or-continue**.

---

### Mental Model
TriFrost middleware is **not a sandwich**.

There is no onion. No unwind. No `next()`.

It’s a pipeline:
```bash
[ A ] → [ B ] → [ C ] → handler
         ⛔️ (halts if returns)
```

👉 Also see: [Request & Response Lifecycle](/docs/request-response-lifecycle)

---

### Best Practices
- ✅ Use `.setState()` to share state downstream
- ✅ Use type constraints to enforce chain correctness
- ✅ Attach middleware at the level it applies: app/group/route
- ✅ Let middleware short-circuit deliberately (401, 429, etc.)
- ✅ Keep each piece focused: **one job per middleware**
- ✅ Use `Context<Env, State>` to lock in types across files

---

### TLDR
- No `next()`, no onion model
- Top-down, linear execution
- Middleware halts chain if it returns a response
- `ctx.setState()` is how you extend context
- TypeScript knows your state chain, and enforces it
- Middleware can run globally, per group, or per route
- Middleware can require a state shape and extend the state

---

### Next Steps
- [Context API](/docs/context-api)
- [Context & State Management](/docs/context-state-management)
- [Router & Route](/docs/router-route)
- [Routing Basics](/docs/routing-basics)
- [Middleware Basics](/docs/middleware-basics)
- [Middleware: Authentication](/docs/middleware-api-auth)
- [Middleware: Cache Control](/docs/middleware-api-cache-control)
- [Middleware: Cors](/docs/middleware-api-cors)
- [Middleware: Security](/docs/middleware-api-security)
- [Rate Limiting](/docs/ratelimiting-api)
- [Request Lifecycle](/docs/request-response-lifecycle)

Every request in TriFrost travels through your app wrapped in a powerful, fully typed `Context` object — your window into the request, environment, state, and control flow.

This doc covers:
- An intro to what the `Context` is
- How `ctx.state` evolves and is enforced
- How typing flows across middleware and handlers
- Why this makes your app safer, leaner, and smarter

---

### 🧱 What is Context?
The `Context` or `ctx` is passed into **every middleware and handler**.

It includes things such as:
- **ctx.env**: Typed runtime environment (eg: config, secrets, etc)
- **ctx.state**: Request-scoped, typed key-value store
- **ctx.query**: Parsed query parameters
- **ctx.body**: Parsed request body (if applicable)
- **ctx.cache**: Per-request cache instance
- **ctx.cookies**: Cookie read/write API
- **ctx.logger**: Per-request structured logger
- **ctx.headers**: Parsed request headers

As well as a whole lot more, no boilerplate/custom scaffolding, you get this for every request, in every runtime.

👉 Read more about:
- [Context](/docs/context-api) and all it offers
- [Body Parser](/docs/bodyparsing) and all it offers

##### Global `ctx()` Utility
> The `ctx()` utility was added in **TriFrost 1.3**
In addition to being passed to handlers and middleware automatically TriFrost now **exposes the active context via a global helper**:
```ts
import {ctx} from '@trifrost/core';

export async function audit() {
  const context = ctx();
  context.logger.info('Auditing from anywhere in the stack');
}
```

This works because TriFrost internally uses AsyncLocalStorage to track request state across the call stack.

It means decorators (`@cache`, `@span`) and helpers (`cacheFn`, `spanFn`) no longer need to be passed `ctx` explicitly and you can call `ctx()` anywhere inside your functions if you want full access.

This keeps APIs clean while still giving you escape hatches when you need them.

## ✅ Best Practices for ctx()
- Prefer explicit ctx in handlers and middleware.
- Use ctx() in helpers, decorators, and deep utilities. Anywhere you’d need to plumb ctx through five layers of function calls is a good fit.
- If a function is already receiving ctx explicitly, use that instead of calling ctx(). This avoids ambiguity and **keeps type inference predictable**.
- `@cache`, `@span`, etc now leverage `ctx()` internally, so you can annotate methods without worrying about context plumbing.

> **Note:** `ctx()` will only return the active context IF part of an active request.

---

### 🧩 State from Route Params
State is automatically initialized with any dynamic path parameters.

For Example:
```typescript
app
  .group('/users/:userId', router => {
    router
      /* ctx.state is typed as {userId: string} */
      .get('', async ctx => {
        ...
      })
      /* ctx.state is typed as {userId: string; assetId: string} */
      .get('/assets/:assetId', async ctx => {
        ...
      })
  })
});
```

This means your `ctx.state` **always includes param values**, typed as `string`, and you can safely build logic or access guards on top of them.

---

### 💡 Type-Safe Context Definitions
You will see this done in many of the TriFrost examples, but we highly encourage you to define your own `Context`, `Router` and `Env` types to ensure ergonomic DX and full type coverage.

Example:
```typescript
// types.ts

import {
  type TriFrostContext,
  type TriFrostRouter
} from '@trifrost/core';

export type Env = {
  DB_URL: string;
  COOKIE_SECRET: string;
};

export type Context<State = {}> = TriFrostContext<Env, State>;
export type Router<State = {}> = TriFrostRouter<Env, State>;
```

Now use these everywhere — **app, routers, middleware, and handlers** — and TypeScript will enforce correctness from top to bottom.

---

### 🔄 Chaining State Across Middleware
TriFrost's middleware chain is **compositional** — each middleware can extend ``ctx.state``, and downstream middleware/handlers will inherit it.
```typescript
app
  .use(authenticateUser) // Adds $auth to state
  .group('/dashboard', router => {
    router
      .use(loadSettings) // Adds settings to state
      .get(myDash) // state has $auth and settings
  })
  .get('/', myHome) // state has $auth
```

Each `.setState({...})` call extends the state **immutably and inferably**, and the full shape is passed downstream.
```typescript
export async function authenticateUser <S> (ctx:Context<S>) {
  const user = await getUser(ctx);
  return ctx.setState({ $auth: user });
}

export async function myDash <S extends {$auth: User}> (ctx:Context<S>) {
  console.log(ctx.state.$auth.name); // fully typed!
}
```

> **Note**: TriFrost’s built-in middlewares — like Auth, Rate Limiting, Session — follow this pattern too. For example all TriFrost auth middleware implementation automatically set `$auth` on state.

##### Call setState() at the end
For the best type inference and DX, always make sure `ctx.setState(...)` is your **final returned value** from a middleware:
```typescript
export async function loadSettings <S> (ctx:Context<S>) {
  const settings = await fetchSettings(ctx);
  return ctx.setState({ settings });
}
```

This lets TypeScript automatically carry forward the new state into the next middleware/handler.

> TriFrost wraps the return value of every middleware to propagate types down the chain — **but only if you return the updated context**

##### What if you can’t do that?
If your logic requires additional work **after** calling `setState()`, you’ll need to **manually specify** the updated state shape in the return type:
```typescript
export async function fetchUser <S> (ctx:Context<S>) {
  const user = await getUserFromDB(ctx);
  ctx.setState({ user });

  // more logic...

  return ctx as Context<S & {user:User}>;
}
```

This ensures that the **correct shape** is **preserved** for the next step.

> **Note**: This is opinionated, but in most cases you should keep middleware as close to single-responsibility as possible.

---

### 🔒 Declaring State Requirements
Handlers (and middleware) **can declare what they expect** on `ctx.state`. This acts like a guard and a compiler-enforced contract.
```typescript
export async function managementDash <S extends {$auth:User}> (ctx:Context<S>) {
  /* In theory, this isn’t necessary — but I’m a defensive coder. */
  if (!ctx.state.$auth.isAdmin) return ctx.abort(403);
}
```

The `managementDash` in our example has declared that it **expects a $auth to be on the incoming state**, if upstream middleware didn't set `$auth`, TypeScript will immediately warn you.
```typescript
app
  /* Typescript will complain as $auth will NOT be available at this point */
  .get('/management', managementDash);
```

This ensures you have **fail-fast typing** across your app.

---

### 🗑️ Cleaning Up State
Need to drop something from state?
```typescript
ctx.delState("userPrefs");
```

The key is removed from both the runtime `ctx.state` object **and** its type signature, reducing bleed and stale usage.

---

### 🌍 Runtime-Aware ctx.env
Your environment (`ctx.env`) contains runtime-specific config and bindings. You define its shape with your `App` instance:
```typescript
const app = new App<Env>();
```

Then access it from any context:
```typescript
ctx.env.DB_URL;
ctx.env.COOKIE_SECRET;
```

Each runtime adapter (Node, Bun, Cloudflare Workers) populates this object automatically.

> **Note**: We suggest, much like your own `Router` and `Context` types that you create an **Env** type, see [Type-Safe Context Definitions](#type-safe-context-definitions). 😞 This is something we can't automatically infer, but at least we can make its shape easily accessible 🤌.

---

### TLDR
- `Context` = lifecycle control, state, env, and utilities in one
- `ctx.state` is fully typed and grows and composes across the middleware chain
- `ctx.setState()` builds up state safely and **immutably**
- `ctx.delState()` lets you prune state with type safety
- `ctx.env` gives you runtime-bound configuration
- Param values (eg: `/user/:userId`) are automatically part of state as strings
- Handlers can tell upstream they require specific state shape via `S extends {...}` in any context
- Define `Context`, `Router`, `Env` types once to lock in safety everywhere

---

### Next Steps
- Learn how to [Compose Middleware Safely](/docs/middleware-basics)
- Explore the [Request Lifecycle](/docs/request-response-lifecycle)
- Dive into [Fallback and Error Handling](/docs/error-notfound-handlers)

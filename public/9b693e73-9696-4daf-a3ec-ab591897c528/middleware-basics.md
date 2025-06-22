Middleware is at the heart of how **TriFrost** works.

It’s the flexible, composable layer that lets you add features, transform requests, guard your routes and control the flow of your app  — with **first-class TypeScript support**.

Let’s break it down.

---

### How Middleware Works

Unlike many frameworks (like Koa or Express), TriFrost middleware:
- **Does not** use an onion model (`next()` → no before/after wrapping).
- Runs **linearly**, in the order you attach it.
- **Short-circuits** if a middleware sends a response, sets a final status, or aborts.

This means:
- ✅ No nested stacks.
- ✅ No magic control flow.
- ✅ Just clear, deliberate execution.

---

### Middleware and Typed Context
TriFrost middleware receives a **strongly typed** [context](/docs/context-api) (`ctx`) that includes:
- A fully-typed `ctx.env` environment (based on your app’s `Env` type).
- A fully typed `ctx.state` object that persists through the entire chain.

This means:
- Middleware **A** can attach something to `ctx.state`.
- Middleware **B** and **C** can safely access that value.

Example:
```typescript
export async function middlewareA <State extends {}> (ctx:Context<State>) {
  return ctx.setState({x:10});
}

export async function middlewareB <State extends {x:number}> (ctx:Context<State>) {
  console.log(ctx.state.x); // 10, fully typed
}
```

---

### Expanding the State:
To expand the state from inside of middleware, always:
- Call `ctx.setState()` as your **final** step.
- **Return its result** so downstream middleware (as well as **Typescript**) sees the updated type.

Example:
```typescript
export async function retrieveUser <State extends {}> (ctx:Context<State>) {
  const user = await getUserFromToken(ctx);
  return ctx.setState({ user });
}
```

In case for some reason you really can't run `setState` as the final action you can always manually type the return from a middleware:
```typescript
type User = {
  ... /* your user type */
};

export async function retrieveUser <State extends {}> (
  ctx:Context<State>
):Promise<Context<State & {user:User}>> {
  /* Some logic */

  ctx.setState({ user });

  /* Some more logic */

  return ctx;
}
```

By ensuring the middleware is correctly typed it guarantees downstream middleware and handlers **know** the new shape of ctx.state.

Need to **remove** values from state? use:
```typescript
/* Key you want to remove */
ctx.delState("user");
```

> Note: The keys provided to **delState** will also be typed according to what is currently known to be on the state.

---

### Enforcing State Requirements
TriFrost’s typing system internally checks middleware state chains.

Example:
```typescript
export async function accessControl <State extends {user:User}>(ctx: Context<State>) {
  if (!ctx.state.user) return ctx.status(401);

  /* your logic */
}
```

If you attach this middleware without first adding **user** to the state:
```typescript
app.use(accessControl); // ❌ TypeScript will complain!
```

But if you attach it **after** the user-adding middleware:
```typescript
app
  .use(retrieveUser)
  .use(accessControl); // ✅ TypeScript passes, 'user' is now guaranteed on state
```

This gives you **safe, predictable chains** without guessing what’s available where.

### Structuring Context and Router
When building out a basic application in a single file everything will magically work, however most real-world applications are spread across multiple files.

This is where the typing system in most frameworks starts to break down. To keep your types tight and consistent, define top-level `Context` and `Router` types.

Example:
```typescript
import {type TriFrostContext, type TriFrostRouter} from '@trifrost/core';

export type Env = {
  GITHUB_API_TOKEN: string;
  TRIFROST_API_TOKEN: string;
  UPTRACE_DSN: string;
};

export type Context<State extends Record<string, unknown> = {}> = TriFrostContext<Env, State>;
export type Router<State extends Record<string, unknown> = {}> = TriFrostRouter<Env, State>;
```

Using these types across your files then locks in:
- Correct typing of `ctx.env` everywhere.
- Predictable state typing across your middleware and handlers.

---

### Chaining Middleware
Attach middleware like:
```typescript
myApp
  .use(authenticate)
  .use(accessControl)
  .get(myHandler)
  ...
```

**Execution flow**:
- `authenticate` runs.
- If it returns nothing and doesn’t lock or abort, `accessControl` runs.
- Finally, `myHandler` runs.

**Key rule:**
If a middleware:
- Returns a response (e.g., `ctx.json()`, `ctx.text()`, `ctx.html()`, `ctx.status()`).
- Sets a 400+ status code (e.g., `ctx.setStatus()`).
- Calls `ctx.abort()`.

Then the chain **stops**.

---

### Built-in Middleware
To handle most universal needs TriFrost comes with batteries-included and ships with some powerful built-in middleware, including:
- **Authentication** (API Key, Bearer, Session Cookie)
- **Rate Limiting**
- **Security Headers**
- **Cache Control**
- **CORS Handling**

You can import and attach these directly from `@trifrost/core`.

---

### Best Practices
- ✅ Keep middleware **focused** — one job, one purpose.
- ✅ Expand `ctx.state` using `ctx.setState()` and **return it**.
- ✅ Type your `Context` and `Router` up front for safety across files.
- ✅ Order middleware deliberately — no after-run layering or wrapping.
- ✅ Use short-circuiting (respond early) **only when intentional**.

---

### Next Steps
- Dive into [Authentication Middleware](/docs/middleware-api-auth)
- Learn about [Rate Limiting](/docs/ratelimiting-api)

---

Middleware in TriFrost gives you power and precision.

No magic, No hidden chains, just clean, deliberate flow.

TriFrost is built on a unified routing and composition system, every app is also a router, and every router can nest and delegate.

This page explains how the App, Router, and Route layers relate, and how to reason about structure, lifecycle, and composition.

---

### 🧱 App is a Router
At its core, [App](/docs/app-class) **extends** [Router](/docs/router-route). This means:
- You can define routes directly on the app
- You can call `.get(...)`, `.group(...)`, `.route(...)`, etc. directly on `app`
- App-level middleware applies to all routes in your app

```typescript
import { App } from '@trifrost/core';

const app = await new App<Env>({})
  .use(myMiddleware)
  .get('/hello', ctx => ctx.text('Hello World'))
  .boot();
```

✅ App is the **root router for your project**.

---

### 🌳 Nesting Routers
TriFrost supports deeply composable routing, **routers can contain routers**.

```typescript
app.group('/api', api => {
  api.group('/v1', v1 => {
    v1.get('/status', ctx => ctx.text('OK'));
  });
});
```

This pattern scales beautifully with growing projects. It allows:
- Clean separation of concerns
- Better control over middleware
- Scoped error/404 handlers
- Shared rate limits and config per group

👉 See: [Routing Basics](/docs/routing-basics)

---

### 🔌 App-level Middleware
Any middleware you register via `app.use(...)` runs on **every incoming request after the middleware's registration**.
```typescript
app
  .use(firstMware)
  .get('/hello', ctx => ctx.text('Hello')) /* Only gets firstMware */
  .use(secondMware)
  .get('/world', ctx => ctx.text('World')) /* Gets firstMware, secondMware */
  .get('/tri', ctx => ctx.text('Frost')) /* Gets firstMware, secondMware */
```

If you need more scoped middleware, attach it to groups or specific routes.
```typescript
app.group('/admin', admin => {
  admin.use(requireAdmin); /* only runs for /admin/* */
});
```

And they can be layered too. Every router spawned from a router automatically gets its parent's middleware as well:
```typescript
app
  .use(firstMware)
  .get('/hello', ctx => ctx.text('Hello')) /* Only gets firstMware */
  .use(secondMware)
  .get('/world', ctx => ctx.text('World')) /* Gets firstMware, secondMware */
  .get('/tri', ctx => ctx.text('Frost')) /* Gets firstMware, secondMware */
  .group('/admin', admin => {
    admin
      .use(adminMware)
      .get('/users', ctx => ...); /* Gets firstMware, secondMware, adminMware */
  })
```

👉 Learn more: [Middleware Basics](/docs/middleware-basics)

Or check out some of our built-in middleware:
- [Auth](/docs/middleware-api-auth)
- [Cache Control](/docs/middleware-api-cache-control)
- [CORS](/docs/middleware-api-cors)
- [Security](/docs/middleware-api-security)

---

### 🩹 Error and Fallback Routing
TriFrost allows you to define custom handlers for:
- **404s (Not Found)** via `onNotFound(...)`
- **≥400 status** or thrown errors via `onError(...)`

```typescript
app
  .get('/hello', ctx => ctx.text('Hello'))
  .onNotFound(ctx => ctx.text('Sorry could not be found'))
  .onError(ctx => ctx.text(`Oh No {${ctx.statusCode)}}`)
```

These can also be scoped per router:
```typescript
app
  .get('/hello', ctx => ctx.text('Hello'))
  .group('/api', api => {
    api
      .get('/users', async ctx => ...)
      .onNotFound(ctx => ctx.json({ error: 'resource does not exist' }))
      .onError(ctx => ctx.json({ error: 'api failure' }));
  });
  .onNotFound(ctx => ctx.text('Sorry could not be found'))
  .onError(ctx => ctx.text(`Oh No {${ctx.statusCode)}}`)
```

TriFrost **automatically falls back to the closest applicable handler**.

👉 See: [Error & 404 Handlers](/docs/error-notfound-handlers)

---

### 🧩 Route Composition with .group and .route
Use `.group(...)` for path-based nesting:
```typescript
app.group('/users/:userId', user => {
  user.get('/profile', showProfile);
});
```

Use `.route(...)` for inline, fluent route composition:
```typescript
app.group('/products', products => {
  products.route('/products/:productId', r => {
    r
      .get(showProduct)
      .put(updateProduct)
      .del(deleteProduct);
  });
});
```

Both `group` and `route` automatically propagate route state (like `userId` or `productId`) to `ctx.state`.

---

### 💡 Why This Structure?
TriFrost’s `App` + `Router` + `Route` architecture is:
- ✅ **Linear**: You always know what runs and in what order
- ✅ **Typed**: Every route carries state and env types downstream
- ✅ **Modular**: You can build isolated routers and plug them in
- ✅ **Explicit**: Nothing is global unless you make it so

This makes reasoning about behavior, especially in production, safe and fast.

---

### 🧠 Common Patterns
##### Modular routers
```typescript
// admin/router.ts
import {type Router} from '~/types';

/**
 * Note that admin here is telling whichever includes it that `isAuthed`
 * needs to be part of the shape of its State
 *
 * Typescript will complain if it isnt
 */
export async function adminRouter <S extends {isAuthed: boolean}>(r: Router<S>) {
  r
    .get('/me', getMe);
    .get('/:id', getUserById);
};

// app.ts
app
  .group('/admin', adminRouter); /* Typescript complains as no isAuthed */

app
  .use(myAuthMiddleware)
  .group('/admin', adminRouter); /* Typescript does not complain */
```
> 🧠 The `S extends { ... }` pattern acts as a **contract between middleware and handler**, TypeScript will **force upstream compliance**.

##### Scoped middleware
```typescript
app.group('/admin', admin => {
  admin.use(requireAdmin);
  admin.get('/dashboard', showDashboard);
});
```

##### Isolated error handling
```typescript
app.group('/api', api => {
  api.onError(ctx => ctx.json({error: 'API Error'}));
});
```

##### Handler State requirement
```typescript
import {type Context} from '~/types';
import {type User} from '~/db';

/* This route explicitly requires $auth on state */
export async function adminPanel<S extends {$auth: User}>(ctx: Context<S>) {
  return ctx.json({dashboard: 'secret stuff'});
}

// app.ts
app
  .group('/admin', admin => {
    admin
      .use(authMiddleware) /* must add $auth to state */
      .get('/panel', adminPanel); /* will fail typecheck if $auth is not added */
  });
```
> 🧠 The `S extends { ... }` pattern acts as a **contract between middleware and handler**, TypeScript will **force upstream compliance**.

---

### TLDR
- `App` is a `Router`, anything you can do in a router, you can do in `app`
- Use `.group(...)` and `.route(...)` to nest and compose logic
- Middleware can be attached at any level: app, router, or route
- 404 and error handlers can be scoped
- Param-based routing automatically sets `ctx.state` (with full typing)
- Keep logic modular by defining routers in their own files and attaching them to `app`

---

### Next Steps
- Understand the [Request Lifecycle](/docs/request-response-lifecycle)
- Learn how to [Compose Middleware](/docs/middleware-basics)
- Dive into [Context & State Management](/docs/context-state-management)
- Explore [Routing Basics](/docs/routing-basics)
- Understand [Error & Fallback Handlers](/docs/error-notfound-handlers)

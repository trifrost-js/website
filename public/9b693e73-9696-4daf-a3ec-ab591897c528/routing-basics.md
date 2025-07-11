TriFrost's router is minimal, fast, and composable. You define routes using intuitive methods (`get`, `post`, `put`, etc.) and handlers that receive the request `ctx`.

> If you've used Express, Fastify, or Hono before, TriFrost will feel immediately familiar, but with cleaner typing, composability, and lifecycle hooks baked in.

---

### Declaring Routes
Routes are defined on an `App` or `Router` instance:
```typescript
app
  .get('/hello', async ctx => ctx.text('Hello world'))
  .post('/submit', async ctx => {
    const body = ctx.body;
    // handle POST
  });
```

Each route method corresponds to an HTTP verb.

You can also group routes together underneath a path:
```typescript
app
  .get('/hello', async ctx => ctx.text('Hello world'))
  .group('/api', r => {
	r
	  .post('/users', ctx => {
		// ... creating a user
	  })
	  .get('/users/:userId', ctx => ctx.text(`Hello ${ctx.state.userId}`))
	  .del('/users/:userId', ctx => {
		// ... deleting a user
	  })
  });
```

---

### Route Parameters
TriFrost supports path parameters with `:` notation:
```typescript
app.get('/user/:id', (ctx) => {
  return ctx.text(`User ID is ${ctx.state.id}`);
});
```

Query parameters are available via `ctx.query.get(...)`, while path parameters are accessible through `ctx.state`.

**Note:** `ctx.state` is automatically **typed from your route**.
```typescript
app.get('/project/:projectId/task/:taskId', (ctx) => {
  const { projectId, taskId } = ctx.state;
  // ...
});
```

---

### Wildcard Routes (*)
TriFrost supports trailing wildcard segments using `*`, allowing you to capture arbitrary trailing segments (including `/`).

```typescript
app.get('/files/*', (ctx) => {
  const path = ctx.state['*'];
  return ctx.text(`Requested file: ${path}`);
});
```
```typescript
app.get('/blog/:year/:month/*', ctx => {
  const { year, month, '*': slugPath } = ctx.state;
  return ctx.json({ year, month, slugPath });
});

/**
 * Request to /blog/2024/07/post/deep/title yields:
 * {
 *   "year": "2024",
 *   "month": "07",
 *   "slugPath": "post/deep/title"
 * }
 */
```

**Wildcards:**
- Must be the **final segment** of the path
- Get captured as `ctx.state['*']`
- Useful for file routing, proxy passthroughs, fallbacks, and vanity URLs

---

### Object-Based Route Definition
For more control, you can use the object form of defining routes:
```typescript
app.get('/account/:id', {
  name: 'AccountDetail',
  timeout: 8000,
  kind: 'std',
  fn: async ctx => {
    const { id } = ctx.state;
    ctx.json({ id });
  }
});
```

This form supports:
- `name`: used for logging/tracing
- `timeout`: override default timeout
- `kind`: route kind (`std`, `health`, etc.)
- `fn`: your actual route logic

---

### Route Groups
Group multiple routes under a shared prefix and config:
```typescript
app.group('/api', (router) => {
  router
    .get('/users', ctx => ctx.text('List'))
    .get('/posts', ctx => ctx.text('Posts'));
});
```

Everything inside inherits the prefix and settings.

**Need to define a timeout?**:
```typescript
app.group('/api', {
  timeout: 5000,
  fn: (router) => {
    router
      .get('/users', ctx => ctx.text('List'))
      .get('/posts', ctx => ctx.text('Posts'));
  },
});
```
> This form is required when passing group-level options (like `timeout`)

---

### Not Found + Error Routes
TriFrost supports customizable `.onNotFound` and `.onError` handlers:
```typescript
app
  .get('/user/:id', ctx => ctx.text(`User ID is ${ctx.state.id}`))
  .onNotFound(ctx => ctx.text('User not found'))
  .onError(ctx => ctx.status(500));
```

These are triggered when:
- No matching route is found (`onNotFound`)
- A thrown error isn’t caught in middleware (`onError`)
- A request has a 4xx/5xx status without being finalized

---

### Middleware Support
All routes support `.use(...)`, including per-router and per-group.
```typescript
app.use(async ctx => {
  ctx.setHeader('X-App-Version', '1.0');
});
```

These middleware can extend state:
```typescript
app
  .get('/hello', async ctx => ctx.text('Hello world'))
  .group('/api/users/:userId', r => {
    r
      .use(async (ctx) => {
        const user = await UserService.get(ctx.state.userId);
        if (!user) return ctx.setStatus(404);

        return ctx.setState({user});
      })
      .get('/', ctx => ctx.text(`Hello ${ctx.state.user.firstName}`))
      .del('/', ctx => {
        // ... deleting a user
      })
  });
```

There's even some built-ins:
- [Authentication](/docs/middleware-api-auth)
- [Cache Control](/docs/middleware-api-cache-control)
- [Cors](/docs/middleware-api-cors)
- [Security](/docs/middleware-api-security)

👉 See: [Middleware Basics](/docs/middleware-basics)

---

### Rate Limiting
While TriFrost doesn’t enforce limits by default, you can enable per-route or global rate limiting using the built-in system:
```typescript
app
  .limit(100) /* Globally */
  .get('/auth', ctx => ctx.text('Rate-limited endpoint');
```
```typescript
app
  ...
  .group('/api', r => {
    r
      .limit(100) /* Group-level */
      .get('/users', async ctx => {
        // ...
        return ctx.json([...]);
      })
      .get('/posts', async ctx => {
        // ...
        return ctx.json([...]);
      });
  })
```
```typescript
app
  ...
  .group('/api', r => {
    r
      .route('/users', route => {
        route
          .limit(100) /* route-level */
          .get(ctx => {
            // ...
            return ctx.json([...]);
          })
          .post(ctx => {
            // ...
            return ctx.json([...]);
          })
      })
      .get('/posts', async ctx => {
        // ...
        return ctx.json([...]);
      });
  })
```
- Limits are enforced per `key` (commonly IP + path + method), this can be defined
- Fully runtime-aware and observable
- You can use Redis, Memory, or external adapters
- You can also declare composite routes using `.route(path, config => ...)`

👉 See: [Rate Limiting API](/docs/ratelimiting-api)

---

### Next Steps
- [Middleware Basics](/docs/middleware-basics)
- [Understanding Context](/docs/understanding-context)
- [Request Lifecycle](/docs/request-response-lifecycle)
- [Router & Route API](/docs/router-route)
- [Error & 404 Handling](/docs/error-notfound-handlers)
- [App Class](/docs/app-class)
- [App & Router Structure](/docs/app-router-structure)

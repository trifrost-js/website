In TriFrost, context is not a magic object, it's a first-class, explicitly constructed entity.

When a request hits your app:
- The runtime adapter (Node, Bun, Workerd) parses the inbound request
- TriFrost constructs a new `ctx` instance
- TriFrost automatically initializes the\n- context body using a bodyParser specific for the runtime\n- the **route params**, eg: `/use/:userId/asset/:file` -> `/user/123/asset/me.jpg` -> ctx.state: `{userId: '123', file: 'me.jpg}`)
- That context flows through your middleware stack and handler chain
- It accumulates state, logs, mutations, headers, and eventually a response

Context is:
- Immutable in structure, but extensible in state (`ctx.setState(...)`), headers (`ctx.setHeaders(...)`), etc
- Isolated per request
- Safe to use across async boundaries
- Fully typed, including env and state

---

### Where does it show up?
Every route handler and middleware receives `ctx` as its first argument:
```typescript
app.get('/greet', async (ctx) => {
  ctx.text(`Hello from ${ctx.path}`);
});

app.use(async (ctx) => {
  return ctx.setState({ startedAt: Date.now() });
});
```

---

### What can I do with it?
See the [Context API](/docs/context-api) for full details, but here’s a quick summary.

##### Request Metadata
```typescript
ctx.method      // 'GET', 'POST', etc
ctx.path        // URL path
ctx.headers     // Inbound headers
ctx.query       // URLSearchParams instance
ctx.body        // Parsed body (if available)
ctx.ip          // IP address (if determinable)
...
```

##### Response Utilities
```typescript
ctx.text('hello world')
ctx.json({ ok: true })
ctx.html(<Page />)
ctx.redirect('/login')
ctx.file('public/logo.png')
```

##### State Management
```typescript
ctx.setState({ user })
ctx.state.user
ctx.delState(['user'])
```

##### Logging & Observability
```typescript
ctx.logger.info('Request started')
ctx.logger.setAttributes({ userId })
...
```

##### Timeout Control
```typescript
ctx.setTimeout(5000)
ctx.clearTimeout()
```

##### Lifecycle Hooks
```typescript
ctx.abort(503)
ctx.end()
ctx.addAfter(fn)
...
```

---

### Can I extend context?
TriFrost's context is built to operate on multiple runtimes, as such **not directly**, but you can pass anything into `ctx.state`, which is the canonical way to attach context-aware data throughout your app.

```typescript
app.use(async (ctx, next) => {
  const user = await auth(ctx);
  ctx.setState({ user });
  await next();
});
```

> All handlers down the chain will now have access to `ctx.state.user`

---

### Design Goals
The `ctx` object in TriFrost is designed with the following principles:
- **Runtime fidelity**: it reflects real request/response lifecycle
- **Zero magic**: you always see what's being passed
- **Traceability**: logs and spans flow through it
- **DX forward**: it's typed, extensible, and predictable

---

### Next Steps
- [Routing Basics](/docs/routing-basics)
- [Middleware Basics](/docs/middleware-basics)
- [CLI Quickstart](/docs/cli-quickstart)

Feeling more adventurous?
- [Context API Reference](/docs/context-api)
- [Context & State Management](/docs/context-state-management)
- [Request Lifecycle](/docs/request-response-lifecycle)


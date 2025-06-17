When something goes wrong — like a missing route, a thrown exception, or a failed validation — TriFrost gives you **precise, explicit control** over how to respond.

You can define two types of fallback handlers:
```typescript
app.onNotFound(ctx => { ... }); /* No route matched */
app.onError(ctx => { ... });    /* Something threw or failed */
```

These handlers can be attached at the **app level or per-router**.

This approach makes it easy to:
- Return a consistent error or 404 response globally
- Customize fallback behavior for a specific route group or API namespace
- Cleanly separate concerns between public and internal error handling

No magic, no hidden propagation, just deliberate fallback control at every level.

> **Important**: If both app-level and router-level handlers exist, the **nearest one wins**. This enables context-aware error handling per route group.

---

### 🔍 404 Handler: onNotFound
```typescript
/* App Level */
app.onNotFound(ctx => ctx.text('Page not found'));

/* Router Level */
app
	.group('/myhappyfrontend', router => {
		router
			.get(...)
			.get(...)
			.onNotFound(ctx => ctx.html((<html>
				...
				<body>
					<h1>404: Happy Frontend confused</h1>
				</body>
			</html>)))
	})
	.group('/myhappyapi', router => {
		router
			.get(...)
			.get(...)
			.onNotFound(ctx => ctx.json('Happy Api is missing bits'))
	})
```

When no route matches the incoming request, this handler will run. It's your place to show a helpful message, redirect, return a structured JSON error or a full-blown HTML page.

---

### 💥 Error Handler: onError
```typescript
/* App Level */
app.onError(ctx => ctx.json({error: 'Internal Server Error'}));

/* Router Level */
app
	.group('/myhappyfrontend', router => {
		router
			.get(...)
			.get(...)
			.onError(ctx => ctx.html((<html>
				...
				<body>
					<h1>{ctx.statusCode}: Happy Frontend not happy</h1>
				</body>
			</html>)))
	})
	.group('/myhappyapi', router => {
		router
			.get(...)
			.get(...)
			.onError(ctx => ctx.json('Happy Api is unhappy'))
	})
```

If a middleware or handler:
- Throws an uncaught exception
- Ends up in a status code ≥ 400 without aborting

... this handler is triggered, allowing you to shape the response however you like.

You can even switch based on status:
```typescript
.onError(ctx => {
  switch (ctx.statusCode) {
    case 401:
      return ctx.json({error: 'Unauthorized'});
    case 403:
      return ctx.json({error: 'Forbidden'});
    default:
      return ctx.json({error: 'Something went wrong'});
  }
});
```

---

### Q: When are they triggered?
Not every issue requires a throw, TriFrost treats errors and anomalies differently.

TriFrost will **automatically** route to onError() if:
- A middleware or handler returns a status ≥ 400
- A middleware or handler doesn't return a full response or abort
- A request times out

Example:
```typescript
export async function auth(ctx: Context) {
  if (!ctx.headers['authorization']) {
	/* Would end up in nearest onError */
    return ctx.setStatus(401);
  }

  ...
}

export async function myUserRoute (ctx: Context) {
	const user = await loadUser(...);

	/* Would end up in nearest onNotFound */
	if (!user) return ctx.setStatus(404);

	...
}
```

---

### Q: What if I don't define them?
If you don’t define these handlers, TriFrost falls back to default responses 4xx/5xx for unhandled 400+ status codes.

But once you register your own, you're in charge of everything. HTML, JSON, redirects, ...

---

### Best Practices
Make sure your fallback handlers are:
- ✅ **Safe** (don’t assume anything is available on `ctx.state`)
- ✅ **Fast** (don’t do DB calls unless you’re debugging)
- ✅ **Predictable** (always return a clear response with a proper status)

---

### TLDR
- `onNotFound()` handles unmatched routes — globally or per-router.
- `onError()` catches thrown errors or unresolved 4xx/5xx cases.
- You can respond with HTML, JSON, redirects — anything.
- The closest defined handler is used (router > app).

---

### Next Steps
- Learn about [Context & State Management](/docs/context-state-management)
- Become eagle-eyed by diving into [Logging & Observability](/docs/logging-observability)

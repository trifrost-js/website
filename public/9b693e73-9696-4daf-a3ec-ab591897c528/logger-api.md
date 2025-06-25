TriFrost’s logging system lives on `ctx.logger` — your built-in toolkit for structured, leveled, context-aware logs and spans.

**No setup required**: Every incoming request automatically gets its own logger, complete with a unique trace ID, span tracking, and all the core context and app metadata baked in.

**Runs across all runtimes**: Whether you’re on Node, Bun, or Workerd, TriFrost automatically wires up a runtime-specific exporter so your logs go somewhere — even if you didn’t configure one.

Think of it as a logbook that always knows which request you’re on, what span you’re in, and which attributes matter — ready for structured export.

> ✨ **Note**: Many deeper logging features (like distributed tracing, external collectors, or advanced exporters) are covered in the [Logging & Observability](/docs/logging-observability) article. Here, we focus purely on the `ctx.logger` API.

---

### Before we continue
- **Middleware is automatically spanned** — you don’t need to manually wrap middleware in spans. TriFrost handles this for you.
- **Logs and spans are flushed automatically** after each request — no need to call `flush()` unless you’re doing something like an explicit shutdown.
- **App metadata (name, version, meta) and context metadata (route, method, status, ...)** are automatically attached as attributes on logs and spans.
- You can (and should) **add custom attributes** using `setAttribute()` or `setAttributes()` to enrich your traces. For example: **internal identifiers** are gold for analysis.
- For method-level tracing, you can also use the `span` **decorator** or `spanFn()` **utility** — see below.
- Logs are **automatically redacted** of sensitive information using a **sensible default**, to customize this all exporters support an omit option. Learn more about this [here](/docs/logging-observability#redaction-scrambling-support)

---

### 🟡 Logging Debug Messages
```typescript
ctx.logger.debug(message:string, data?:Record<string, unknown>):void
```

Logs a **low-level debug** message.

This is only emitted when your app was created with **debug: true** — perfect for noisy internal details you don’t want flooding production logs.

Example:
```typescript
ctx.logger.debug('User lookup started', {userId: ctx.state.userId});
```

---

### 🔵 Logging Info Messages
```typescript
ctx.logger.info(message:string, data?:Record<string, unknown>):void
```

Logs an **informational** message — the backbone of your normal operational logs.

Example:
```typescript
ctx.logger.info('Request completed', {
  path: ctx.path,
  statusCode: ctx.statusCode
});
```

---

### ⚠️ Logging Warnings
```typescript
ctx.logger.warn(message:string, data?:Record<string, unknown>):void
```

Logs a **warning** — something non-fatal but worth your attention.

Example:
```typescript
ctx.logger.warn('Deprecated API endpoint used', {path: ctx.path});
```

---

### 🔥 Logging Errors
```typescript
ctx.logger.error(error:Error|string|unknown, data?:Record<string, unknown>):void
```

Logs an **error or exception**.

If you pass an `Error` instance, the stack trace is automatically included.

Example:
```typescript
try {
  await expensiveOperation();
} catch (err) {
  ctx.logger.error(err, {operation: 'expensiveOperation'});
}
```

---

### 📦 Spans
A **span** represents a single unit of work in your system — think of it like a timer wrapped around a specific operation.

For example:
- A span might cover "fetching user from database."
- Another span might wrap "rendering HTML response."

Together, spans form a tree of **where time was spent** inside a request.

Spans can also carry **metadata** (attributes) and are linked together by a shared trace ID, letting observability tools reconstruct the full picture of a request as it moves through your system.

In short: spans tell you **what happened, when, and how long it took** — across services, layers, and functions.

![Example Signoz spans for the TriFrost Website](/media/signoz_spans.png)

##### Decorator and Utility
**Decorator**: `span()`
```typescript
import {span} from '@trifrost/core';

class MyService {
  @span()
  async process(ctx) {
    // Automatically traced as "process"
  }

  @span('customSpanName')
  async special(ctx) {
    // Traced as "customSpanName"
  }
}
```

**Utility**: `spanFn()`
```typescript
import {spanFn} from '@trifrost/core';

const process = spanFn('process', async (ctx) => {
  // Automatically wrapped in a span
});
```

Both are great for **instrumenting services, utilities, or helpers** where you want lightweight tracing without clutter.

> **⚠ Important**:
> For the decorator or `spanFn()` to work, they need to find a `ctx.logger`.\n- In class methods, they look for the first argument being a `ctx`, falling back to `this.logger` or `this.ctx`.\n- In standalone functions, they look for the first argument being `ctx`.
> Without that, your function will still work, but **no span will be attached**.

##### logger.span (inline)
```typescript
await ctx.logger.span<T>(name:string, fn:() => Promise<T>|T):Promise<T>
```

Wraps a block of code in a **named span**, automatically tracking its start and end time, and sending it to span-aware exporters (like OTEL).

Example:
```typescript
await ctx.logger.span('loadUserProfile', async () => {
  const user = await loadUser(ctx.state.userId);
  ctx.setState({user});
});
```

##### Manually Start/End Spans
```typescript
const span = ctx.logger.startSpan(name:string);
span.setAttribute(key, value);
span.setAttributes({...});
span.end();
```

Manually start a span you control — useful when you need to track something over time or across multiple function calls.

Example:
```typescript
const span = ctx.logger.startSpan('manualProcessing');
span.setAttribute('step', 'start');

await phaseOne();
span.setAttribute('step', 'phaseOneCompleted');

await phaseTwo();
span.end();
```

---

### 🧩 Setting Context Attributes
```typescript
ctx.logger.setAttribute(key:string, value:unknown):this
ctx.logger.setAttributes(attrs:Record<string, unknown>):this
```

Attach persistent **context attributes** to the logger — these will appear on all subsequent logs and spans.

Spans **inherit all context-level attributes** at the moment they are created. If you add attributes after starting a span, they won’t retroactively apply to it — set important attributes early.

These attributes apply only for the lifespan of the current `ctx.logger` (i.e., the current request); they do not persist globally or across requests.

Example:
```typescript
ctx.logger.setAttributes({
  userId: ctx.state.user.id,
  tenantId: ctx.state.tenant.id
});
ctx.logger.info('User session updated');
```

---

### 📤 Flushing Logs and Spans
```typescript
await ctx.logger.flush():Promise<void>
```

Forces all buffered logs and spans to be pushed to the configured exporters — especially useful when shutting down or doing edge returns.

Example:
```typescript
await ctx.logger.flush();
return ctx.text('Shutting down gracefully');
```

---

### 🚚 Exporters
TriFrost ships with:
- [ConsoleExporter](/docs/exporters-console)\nStructured logs to `console` with grouping and formatting, ideal for **local dev and CI** runs.
- [JsonExporter](/docs/exporters-json)\n>Emits NDJSON-formatted logs to `console` or custom sink, ideal for **File-based logs, piping**.
- [OtelHttpExporter](/docs/exporters-otel)\n>Sends logs + spans to an OTLP-compatible backend, ideal for **production observability**

Exporters are configured once when creating your `App` instance (see `tracing.exporters` in the App config). You can combine multiple exporters to target both local logs and external collectors.

> ✨ **Note**: If no exporter is configured **each runtime will instantiate their default exporter**. Node.js/Bun use `ConsoleExporter` and Workerd uses `JsonExporter`

For more details, see:
- [Core Concepts: Logging & Observability](/docs/logging-observability)
- [App API Reference](/docs/app-class)

---

### Best Practices
- ✅ Use **static message strings** with structured data (instead of fully dynamic messages) — this improves how observability systems group and index logs.
- ✅ Use spans to **track durations** for important operations — especially when you care about performance or tracing.
- ✅ Add **custom attributes** (like `userId`, `tenantId`, etc.) to enrich your traces.
- ✅ You almost never need to call `flush()` manually — TriFrost handles it at the end of the request. Tip: Only call `flush()` if you need immediate delivery (for example, before an early exit or when doing non-standard asynchronous work outside the request lifecycle).
- ✅ Middleware is **already spanned** by the framework — don’t wrap middleware manually.

---

### Resources
- [Logging & Observability](/docs/logging-observability)
- [App Class Config](/docs/app-class)
- [ConsoleExporter Guide](/docs/exporters-console)
- [JsonExporter Guide](/docs/exporters-json)
- [OtelHttpExporter Guide](/docs/exporters-otel)
- [OpenTelemetry](https://opentelemetry.io/)
- [MDN: Console API](https://developer.mozilla.org/en-US/docs/Web/API/console)

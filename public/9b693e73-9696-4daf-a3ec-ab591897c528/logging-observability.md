TriFrost was built with observability in its DNA — not as an add-on, but as a first-class, runtime-aware, autoredacting logging system designed for real-world production use.

This article dives into:
- The logging & tracing architecture
- Exporter system (Console, JSON, OTEL)
- Spans & trace propagation
- Attribute handling & scrubbing
- Best practices for production observability

> Looking for how to use `ctx.logger`? See the [Logger API article](/docs/logger-api) for methods, examples, and usage patterns.

---

### 🧱 Architecture
Every TriFrost request gets a scoped, **context-aware logger** with:
- Unique `traceId` (32-char OTEL-compliant hex)
- Active `spanId` (16-char OTEL-compliant hex), if within a span
- Attached `ctx` and app metadata
- Per-request attribute store

This is backed by a **Root Logger**, which handles app-level metadata and exporter setup. Loggers are lazily spawned per-request from the **Root Logger** and flushed automatically at the end of each request.

You will never need to touch the root logger directly as this is **internal** to TriFrost, but just imagine something akin to the following **pseudo-code**
```typescript
/* App-level root setup */
const rootLogger = new TriFrostRootLogger({
	name: cfg.name,
	version: cfg.version,
	debug: true,
	rootExporter: new ConsoleExporter(),
	exporters: env => [... (your configured exporters)]
});

/* On incoming request */
async onIncoming (ctx) {
  ctx.logger = rootLogger.spawn({
    ... ctx-specific bits
  });
}
```

---

### 🔁 Spans & Tracing
Spans form a core part of the **open telemetry** specification, they represent a single unit of work in your system — think of it like a timer wrapped around a specific operation.

For example:
- A span might cover "fetching user from database."
- Another span might wrap "rendering HTML response."

Together, spans form a tree of **where time was spent** inside a request.

Spans can also carry **metadata** (attributes) and are linked together by a shared trace ID, letting observability tools reconstruct the full picture of a request as it moves through your system.

In short: spans tell you **what happened, when, and how long it took** — across services, layers, and functions.

TriFrost has first-class **span support** — both inline and decorator-based. TriFrost also **spans middleware automatically**, so you get performance visibility across the full request lifecycle.

There's built-in helpers you can use for this:
```typescript
// Inline block span
await ctx.logger.span("fetchUser", async () => {
  // your logic
});

// Manual start/end
const span = ctx.logger.startSpan("transformData");
span.setAttribute("foo", "bar");
...
span.end();
```

For services or helpers outside of ctx-driven handlers, TriFrost provides trace decorators:
```typescript
import {span, spanFn} from '@trifrost/core';

class UserService {
  @span("user.load")
  load(ctx) { ... }
}

const process = spanFn("job.process", async ctx => { ... });
```

Both look for:
- `ctx.logger`
- or `this.logger`/`this.ctx.logger`

If no logger is found, they **gracefully no-op** — your function runs unwrapped.

> Excited about spans and tracing? See the [Logger API article](/docs/logger-api) for methods, examples, and usage patterns.

##### Pitfalls
- If you call `setAttribute(...)` after a span is started, it won’t retroactively affect earlier spans.
- Always `end()` spans — or use `ctx.logger.span(name, fn)`, the `@span` decorator or `spanFn` function which handle this for you.

---

### 📦 Exporters
TriFrost uses an **exporter model** — logs and spans are pushed to one or more exporters, which handle **formatting, redaction**, and **delivery** to their final destination (console, file, or observability backend).

This architecture lets you:
- Mix exporters (e.g. console + OTEL)
- Customize per-environment output
- Control log shape, sink, and security behavior

You define exporters in your app setup:
```typescript
import {App, ConsoleExporter, OtelHttpExporter} from '@trifrost/core';

new App({
  tracing: {
    exporters: ({env}) => [
      new ConsoleExporter(),
      new OtelHttpExporter({
        logEndpoint: env.OTEL_LOGS,
        spanEndpoint: env.OTEL_SPANS,
      })
    ]
  }
});
```

##### Available Exporters
- [ConsoleExporter](/docs/exporters-console)\nStructured logs to `console` with grouping and formatting, ideal for **local dev and CI** runs.
- [JsonExporter](/docs/exporters-json)\nEmits NDJSON-formatted logs to `console` or custom sink, ideal for **File-based logs, piping**.
- [OtelHttpExporter](/docs/exporters-otel)\nSends logs + spans to an OTLP-compatible backend, ideal for **production observability**

> You can use **multiple exporters at once**, and they will each receive the full log/span stream independently.
> 💡 Want dynamic behavior between dev and prod? Use TriFrost’s [isDevMode()](/docs/utils-devmode) utility for easier handling.


👉 For detailed examples, configuration options, and best practices, check each exporter's dedicated guide: [ConsoleExporter Guide](/docs/exporters-console), [JsonExporter Guide](/docs/exporters-json), [OtelHttpExporter Guide](/docs/exporters-otel)

##### Redaction + Safety
All exporters support the `omit` option to scrub sensitive fields. See [Scrambling Hygiene](#redaction-scrambling-support) for details on configuration and built-in presets.

---

### 🛡 Redaction (Scrambling) Support
Out of the box, TriFrost will **scrub sensitive keys** option for redacting sensitive or personally identifiable information from logs.

This is powered internally by a **high-performance scrambler engine** capable of deeply scanning objects and masking fields using:
- **Path-based matching** – e.g. `'user.token'`
- **Global key matching** – e.g. `{global: 'token'}` (matches at any depth)
- **Regex-based value matching** – e.g. `{valuePattern: /\d{3}-\d{2}-\d{4}/}` (matches SSNs, emails, etc.)

Scrubbed values are replaced with `***`, making redaction visible without losing context.

A default set of safe redaction rules is available via `OMIT_PRESETS.default` (but this is the default so unless customizing you dont need to use this):
```typescript
import {OMIT_PRESETS} from '@trifrost/core';

new JsonExporter({
  omit: [...OMIT_PRESETS.default, {global: 'custom_secret'}],
});
```

For example:
```typescript
{
  user: {
    id: 42,
    full_name: 'Jane Doe',
    email: 'jane.doe@example.com',
    preferences: {
      theme: 'dark',
      newsletter: true,
    },
  },
  auth: {
    method: 'oauth',
    token: 'abc123',
  },
  activity: {
    message: 'User with email jane.doe@example.com logged in from +1 (800) 123-4567',
    timestamp: '2025-06-09T12:00:00Z',
  },
}
```

Becomes:
```typescript
{
  user: {
    id: 42,
    full_name: '***',
    email: '***',
    preferences: {
      theme: 'dark',
      newsletter: true,
    },
  },
  auth: {
    method: 'oauth',
    token: '***',
  },
  activity: {
    message: 'User with email *** logged in from ***',
    timestamp: '2025-06-09T12:00:00Z',
  },
}
```


TriFrost maintains a sensible list of defaults which lives in the `OMIT_PRESETS` constant within the TriFrost codebase (available through `import {OMIT_PRESETS} from '@trifrost/core'`).
```typescript
OMIT_PRESETS.default = [
  /* Sensitive */
  {global: 'access_token'},
  {global: 'api_key'},
  {global: 'api_secret'},
  {global: 'apikey'},
  {global: 'apitoken'},
  {global: 'auth'},
  {global: 'authorization'},
  {global: '$auth'},
  {global: 'client_secret'},
  {global: 'client_token'},
  {global: 'id_token'},
  {global: 'password'},
  {global: 'private_key'},
  {global: 'public_key'},
  {global: 'refresh_token'},
  {global: 'secret'},
  {global: 'session'},
  {global: 'session_id'},
  {global: 'sid'},
  {global: 'token'},
  {global: 'user_token'},
  {valuePattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/},
  /* PII */
  {global: 'first_name'},
  {global: 'last_name'},
  {global: 'full_name'},
  {valuePattern: /[\w.-]+@[\w.-]+\.\w{2,}/}, /* Email */
  {valuePattern: /\+?\d{1,2}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/}, /* Phone */
  {valuePattern: /\b\d{3}-\d{2}-\d{4}\b/}, /* SSN */
  {valuePattern: /\b(?:\d[ -]*?){13,16}\b/}, /* Credit card */
];
```

##### Expand on defaults
Each exporter supports configuring the `omit` behavior, for example lets say you want to redact every key with the name `ssn`:
```typescript
import {OMIT_PRESETS} from '@trifrost/core';

new ConsoleExporter({omit: [...OMIT_PRESETS, {global: 'ssn'})
```

##### I dont like the defaults
We're saddened to hear that, but in case you really don't like the defaults you simply ... omit ... the OMIT_PRESETS:
```typescript
new ConsoleExporter({omit: [{global: 'ssn'});
```

In the above example **only** the **ssn** key will be scrubbed, up to you to ensure no other sensitive data reaches your logs 🫡, good luck soldier!

##### I dont want redaction
Without asking **why?** (I guess you have your reasons):
```typescript
new JsonExporter({omit: []}); /* Or Console/Otel exporter */
```

---

### 🧩 Attributes
In TriFrost, structured logging isn’t just about `message` and `level`. It's about **context** — the **who, what, where** of every log line and span.

Attributes are the key.

This section covers:
- What attributes are and why they matter
- How attributes propagate across logs and spans
- Best practices for setting, managing, and securing them

##### What Are Attributes?
Attributes are **structured key-value pairs** that attach to logs and spans.

They can represent:
- Internal IDs (`userId`, `tenantId`)
- Environment markers (`region`, `runtime`)
- Flow markers (`step`, `phase`)
- Any other contextual metadata you want to enrich your observability with

They’re not visible in the top-level log message — but they power your observability backend’s ability to **filter, group, correlate, and debug**.

##### Built-in Attributes
TriFrost automatically attaches a small set of **global attributes** to every log and span:

Globally (App-wide):
- `service.name`: Your app name (from [config](/docs/app-class))
- `service.version`: Your app version (from [config](/docs/app-class))
- `runtime.name`: Active runtime (node, bun, workerd, ...)
- `runtime.version`: Detected runtime version (if applicable, eg: `20.12.0`)
- `telemetry.sdk.name`: `'trifrost'`
- `telemetry.sdk.language`: `'javascript'`

Per Request:
- `http.method`: request method (eg: `GET`)
- `http.target`: request path (eg: `/user/4794`)
- `http.route`: registered route (eg: `/user/:userId`)
- `http.status_code`: eventual status code
- `otel.status_code`: otel status code
- `user_agent.original`: User Agent header

**Note**: These are named like that because of how the OTEL structured spec works and they will be picked up by observability platforms correctly that way. For example look at the sidebar in the following image:
![Example Signoz spans for the TriFrost Website](/media/signoz_spans.png)

##### Setting Attributes

All TriFrost loggers (including `ctx.logger`) support attribute injection:

```ts
ctx.logger.setAttribute("userId", ctx.state.user.id);
ctx.logger.setAttributes({
  tenantId: ctx.state.tenant.id,
  plan: ctx.state.tenant.plan
});
```

Once set, these attributes apply to:
- All subsequent **logs**
- Any new **spans** created **after** the set

##### Span Inheritance
When you start a span (`ctx.logger.span(...)`, `@span`, `spanFn()`), it **captures a snapshot** of the current attributes.
```typescript
ctx.logger.setAttribute("db.shard", "eu-1");

await ctx.logger.span("loadUser", async () => {
  // span includes { db.shard: 'eu-1' }
});
```
> Set attributes before creating spans to ensure correct propagation.

If you need to attach attributes after a span has started, use:
```typescript
const span = ctx.logger.startSpan("custom");
// ... your logic

span.setAttribute("foo", "bar");

// ... your logic

span.end();
```

##### Avoid Overlogging
Not everything should be an attribute.

**Do not** treat attributes as a dumping ground for:
- Raw PII (email, address, etc.)
- Sensitive tokens
- Full error objects or stack traces

Use attributes for **identifiers and stable markers** — keep the noisy or risky bits in the `data` field (second argument for logs).

##### Redacting Attributes
If you ever accidentally attach sensitive data, don’t worry — **all attributes are passed through the omit scrambler system**, just like `data` and `ctx`.

This means:
```typescript
ctx.logger.setAttribute("access_token", "supersecret");
```

will become:
```json
"access_token": "***"
```

👉 See [Scrambling Hygiene](/docs/logging-observability#redaction-scrambling-support) for full explanation

---

### Best Practices
- ✅ Use static message strings + structured `data`. These help with observability and allow for grouping and easier introspection
- ✅ Enrich attributes with your own internal identifiers such as `userId`, `tenant`, etc. via `setAttribute(...)` or `setAttributes({...})`
- ✅ Enrich attributes using stable identifiers (eg: 'userId'), not transient or verbose values.
- ✅ Enrich attributes using flat and readable keys (e.g. `userId`, not `meta.user.details.uid`).
- ✅ Span expensive or critical operations such as database calls, this adds richness and allows you to pinpoint performance problems.
- ✅ Let TriFrost handle request lifecycle — don’t double-wrap middleware
- ✅ Never log secrets, tokens, or raw PII — trust the scrambler, but **don’t rely on it blindly**, be vigilant 👀
- ✅ Treat attributes as your **semantic contract with observability**

---

### Resources
- [Logger API](/docs/logger-api)
- [App Class Config](/docs/app-class)
- [ConsoleExporter Guide](/docs/exporters-console)
- [JsonExporter Guide](/docs/exporters-json)
- [OtelHttpExporter Guide](/docs/exporters-otel)
- [OpenTelemetry](https://opentelemetry.io/)
- [Distributed Tracing Concepts](https://opentelemetry.io/docs/concepts/)

The `ConsoleExporter` in TriFrost is a structured, customizable logger that writes to the system console (`console.log`, `console.error`, etc).

It supports:
- Collapsed log grouping
- Log enrichment with tracing & context
- Field redaction (`omit`)
- Custom formatting

It’s the **default exporter in development** for all runtimes.

---

### 📥 Import and Use
```typescript
import {App, ConsoleExporter} from '@trifrost/core';

new App({
	...
	tracing: {
		exporters: ({env}) => [
			new ConsoleExporter({
				grouped: true,
				include: ['trace_id', 'ctx'],
				omit: [...], // see below
				format: log => `[${log.level.toUppercase()}] ${log.message}`,
			}),
		],
	}
	...
})
```

You provide this when configuring your App setup, there's sensible defaults at play so in most cases `new ConsoleExporter()` will be enough.

---

### ⚙️ Available Options
- `grouped`: boolean\nWhether logs with metadata should use `console.groupCollapsed(...)`.\n**default**: `false`
- `include`: `'ctx' | 'trace_id' | 'span_id' | 'time' | 'level' | 'global'`\nAdditional metadata to include in the log object.\n**default**: `[]`
- `omit`: TriFrostLogScramblerValue[]\nKeys to redact from data/ctx/global payloads. Learn more [here](/docs/logging-observability#redaction-scrambling-support)\n**default**: `OMIT_PRESETS.default`
- `format`: (log:TriFrostLogPayload) => string\nCustom formatter for the top-level message.\n**default**: `[time] [level] message`

---

### Examples
##### Basic Configuration
```typescript
new ConsoleExporter();
```
> Prints: `[2025-06-06T10:30:00.000Z] [info] User logged in`

##### Grouped with Trace ID
```typescript
new ConsoleExporter({
	grouped: true,
	include: ['trace_id']
});
```
> Output: `▶ [2025-06-06T10:30:00Z] [info] User logged in\n  trace_id: 3c51d...\n  data: {userId: "abc123"}`

##### Add Context & Global App Info
```typescript
new ConsoleExporter({
	include: ['trace_id', 'ctx', 'global']
});
```
> Output includes: `{\n  "ctx": {"method": "GET", "path": "/login"},\n  "global": {"service.name": "my-app", "service.version": "1.2.3"}\n}`

##### Custom Format Line
```typescript
new ConsoleExporter({
	format: log => `(${log.level.toUpperCase()}) ${log.message}`
});
```
> Output: `(INFO) Session started`

##### Redact Sensitive Fields
```typescript
import {OMIT_PRESETS, ConsoleExporter} from '@trifrost/core';

new ConsoleExporter({
	omit: [...OMIT_PRESETS.default, {global: 'ssn'}]
});
```

👉 See [Scrambling Hygiene](/docs/logging-observability#redaction-scrambling-support) for full explanation

---

### Best Practices
- ✅ Use in dev or CI/CD jobs for lightweight structured output
- ✅ Combine with `include: ['ctx', 'trace_id']` to enrich log metadata
- ✅ Customize formatting to match your console style
- 💡 You can use this exporter **in tandem** with `JsonExporter` or `OtelHttpExporter`
- 💡 Want to go fancy? Make use of TriFrost's [isDevMode](/docs/utils-devmode) function to refine between dev and prod
- ❌ Don’t use in high-throughput prod — prefer OTEL-compatible exporters with a dedicated backend

---

### Resources
- [TriFrost Logging & Observability](/docs/logging-observability)
- [Logger API Reference](/docs/logger-api)
- [Dev Mode](/docs/utils-devmode)
- [Console API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/console)

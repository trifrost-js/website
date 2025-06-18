The `JsonExporter` in TriFrost outputs logs as pure JSON — making it ideal for structured logging pipelines, file sinks, or log aggregation systems that expect newline-delimited JSON (NDJSON).

It supports:
- JSON-formatted log output
- Optional custom **sink** function
- Field redaction (`omit`)

It's especially useful when:
- You’re running in a container and want to `stdout` to a JSON collector
- You want logs to be testable/assertable in memory
- You’re building your own log ingestion flow

It's the **default exporter in production** for the [Workerd runtime](/docs/cloudflare-workers-workerd).

---

### 📥 Import and Use
```typescript
import {App, JsonExporter} from '@trifrost/core';

new App({
  ...
  tracing: {
    exporters: ({env}) => [
      new JsonExporter({
        omit: [...], // see below
        sink: log => process.stdout.write(JSON.stringify(log) + '\n')
      }),
    ],
  }
  ...
})
```

You provide this when configuring your App setup, there's sensible defaults at play so in most cases `new JsonExporter()` will be enough.

> **Note**: If no sink is provided, logs are written to console[log.level].

---

### ⚙️ Available Options
- `omit`: TriFrostLogScramblerValue[]\nKeys to redact from data/ctx/global payloads. Learn more [here](/docs/logging-observability#redaction-scrambling-support)\n**default**: `OMIT_PRESETS.default`
- `sink`: (entry:JsonExporterEntry) => void\nCustom log writer — lets you pipe logs to a file, socket, or in-memory store.

##### JsonExporterEntry
The `JsonExporterEntry` object looks like this:
```json
{
  "time": "2025-06-06T10:30:00.000Z",
  "level": "info",
  "message": "User logged in",
  "trace_id": "3c51d...",
  "span_id": "a1b2c3d4",
  "ctx": {...},
  "data": {...},
  "global": {...}
}
```
This shape is structured and predictable, making it ideal for ingestion by:
- Datadog
- Vector.dev
- FluentBit
- Loki
- CloudFlare observability (TriFrost is using this)
- ...

---

### Examples
##### Sink
```typescript
import {JsonExporter} from '@trifrost/core';
import {LogService} from './LogService'; /* eg: singleton instance which pushes to file */

new JsonExporter({
  sink: log => LogService.push(JSON.stringify(log)),
});
```

##### Override Defaults
```typescript
new JsonExporter({
  omit: [{global: 'ssn'}] // Only redact 'ssn', not full default list
});
```
> **Note**: ⚠️ Be very careful, you dont want to leak secrets, our advice is to always do something akin to `omit: [...OMIT_PRESETS.default, (your own expansion)]`

👉 See [Scrambling Hygiene](/docs/logging-observability#redaction-scrambling-support) for full explanation

---

### Best Practices
- ✅ Use in CI, production, or custom log sinks
- ✅ Pipe output to file or stream sinks (via `sink`)
- ✅ Keep one exporter per format — don’t double-format
- 💡 You can use this exporter **in tandem** with `JsonExporter` or `OtelHttpExporter`
- 💡 Want to go fancy? Make use of TriFrost's [isDevMode](/docs/utils-devmode) function to refine between dev and prod

---

### Resources
- [TriFrost Logging & Observability](/docs/logging-observability)
- [Logger API Reference](/docs/logger-api)
- [Dev Mode](/docs/utils-devmode)
- [NDJSON](http://ndjson.org/)

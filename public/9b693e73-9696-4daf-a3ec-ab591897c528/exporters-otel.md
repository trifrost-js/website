The `OtelHttpExporter` sends **structured logs and spans to an OpenTelemetry-compatible collector via HTTP.** It’s TriFrost’s production-grade exporter when you want **real observability, including distributed tracing, performance timelines, and full-context logs**.

It supports:
- OTLP-over-HTTP export of logs and spans
- Batch buffering, retry with backoff, and payload scrubbing
- Compatible with tools like: [SigNoz](https://signoz.io/), [Uptrace](https://uptrace.dev/), [Grafana Tempo](https://grafana.com/oss/tempo/), ...

The TriFrost website for example uses a combination of [JsonExporter](/docs/exporters-json) for [Cloudflare observability](https://www.cloudflare.com/developer-platform/products/workers-observability/) **and OTEL** through [UpTrace](https://uptrace.dev).

---

### 📥 Import and Use
```typescript
import {App, OtelHttpExporter} from '@trifrost/core';

new App({
  ...
  tracing: {
    exporters: ({env}) => [
      new OtelHttpExporter({
        logEndpoint: env.OTEL_LOGS,
        spanEndpoint: env.OTEL_SPANS,
        headers: {
          Authorization: `Bearer ${env.OTEL_TOKEN}`
        }
      }),
    ],
  },
  ...
})
```

> **Note**: 💡 By default, logs and spans are flushed at the end of each request — you do **not** need to manually call `flush()`.

---

### ⚙️ Available Options
- `logEndpoint`: string\nOTEL collector HTTP endpoint for logs.
- `spanEndpoint`: string\nOptional. If not provided, `logEndpoint` is reused for spans.
- `headers`: `Record<string, string>`\nOptional headers to include in every OTLP request. (usually for authorization purposes)
- `maxBatchSize`: number\nHow many logs/spans to batch before flushing.\n**default**: `20`
- `maxBufferSize`: number\nMaximum retained buffer size if transport fails.\n**default**: `10 000`
- `maxRetries`: number\nNumber of retries for failed deliveries.\n**default**: `3`
- `omit`: TriFrostLogScramblerValue[]\nFields to redact before export.\n**default**: `OMIT_PRESETS.default`

👉 See [Scrambling Hygiene](/docs/logging-observability#redaction-scrambling-support) for how redaction works

---

### 🚚 What gets sent?
##### Logs -> OTEL resourceLogs
Each `ctx.logger.log(...)` call is sent as an OTLP log record:
```json
{
  "timeUnixNano": 1717689600000000000,
  "severityText": "INFO",
  "body": {"stringValue": "User logged in"},
  "attributes": [
    {"key": "trace_id", "value": {"stringValue": "abc..."}},
    {"key": "ctx.userId", "value": {"stringValue": "123"}},
    {"key": "data.status", "value": {"stringValue": "success"}}
  ]
}
```

##### Spans -> OTEL resourceSpans
Spans created via `ctx.logger.span(...)`, decorators, or middleware tracing are serialized as full OTLP spans:
```json
{
  "name": "fetchUser",
  "traceId": "...",
  "spanId": "...",
  "startTimeUnixNano": 1717689600000000000,
  "endTimeUnixNano": 1717689600123456000,
  "attributes": [
    {"key": "db.query", "value": {"stringValue": "SELECT * FROM users WHERE ..."}}
  ]
}
```

---

### Retry and Buffering
- Batches are retried up to `maxRetries` times on network failure
- Retries use **jittered exponential backoff**
- If all retries fail, logs/spans are **requeued if within buffer limit**, otherwise they're **dropped** to prevent memory pressure

> **Note**: Failed sends log a console warning — you may wish to hook this in production.

---

### Examples
##### Minimal
```typescript
new OtelHttpExporter({
  logEndpoint: 'https://collector.mycompany.com/v1/logs'
});
```

##### With custom headers
```typescript
new OtelHttpExporter({
  logEndpoint: 'https://otel.example.com/v1/logs',
  headers: {
    'X-Project-ID': 'abc123',
    'Authorization': `Bearer ${process.env.OTEL_TOKEN}`
  }
});
```

##### Custom retry/batch settings
```typescript
new OtelHttpExporter({
  logEndpoint: 'https://myotel/logs',
  maxBatchSize: 50,
  maxBufferSize: 5000,
  maxRetries: 5
});
```

##### SigNoz (EU Region)
```typescript
new OtelHttpExporter({
  logEndpoint: 'https://ingest.eu.signoz.cloud/v1/logs',
  spanEndpoint: 'https://ingest.eu.signoz.cloud/v1/traces',
  headers: {
    'signoz-access-token': env.SIGNOZ_API_TOKEN
  }
});
```
> **Note**: You'll find this token in your **SigNoz project settings** under **API Tokens**. Make sure you match the ingest region (`eu`, `us`, etc).

👉 See [SigNoz OTEL Setup](https://signoz.io/docs/instrumentation/otel-collector/) for more info

##### Uptrace
```typescript
new OtelHttpExporter({
  logEndpoint: 'https://otlp.uptrace.dev/v1/logs',
  spanEndpoint: 'https://otlp.uptrace.dev/v1/traces',
  headers: {
    'uptrace-dsn': env.UPTRACE_DSN
  }
});
```
> **Note**: The `uptrace-dsn` is a secure connection string from your Uptrace project — it contains project ID, token, and endpoint info.

👉 See [Uptrace DSN Guide](https://uptrace.dev/get/started.html#dsn) for more info

---

### Best Practices
- ✅ Use in production when full tracing and telemetry are required
- ✅ Tune `maxBatchSize` and `maxBufferSize` based on expected traffic
- ✅ Set meaningful redaction via `omit`
- 💡 You can use this exporter **in tandem** with other exporters such as [JsonExporter](/docs/exporters-json)
- 💡 Want to go fancy? Make use of TriFrost's [isDevMode](/docs/utils-devmode) function to refine between dev and prod
- ❌ Don’t rely on it for logs in CI — prefer Console/Json exporters

---

### Resources
- [TriFrost Logging & Observability](/docs/logging-observability)
- [Logger API Reference](/docs/logger-api)
- [Dev Mode](/docs/utils-devmode)
- [OpenTelemetry](https://opentelemetry.io)
- [OpenTelemetry Protocol (OTLP)](https://opentelemetry.io/docs/specs/otlp/)
- [SigNoz](https://signoz.io)
- [SigNoz OTEL Setup](https://signoz.io/docs/instrumentation/otel-collector/)
- [Uptrace](https://uptrace.dev/)
- [Uptrace DSN Guide](https://uptrace.dev/get/started.html#dsn)

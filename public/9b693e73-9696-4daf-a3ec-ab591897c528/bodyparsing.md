TriFrost handles body parsing automatically, no middleware needed.

Whether you're accepting `JSON`, `text`, `form`, `file uploads`, or `raw buffers`, it's all parsed and available on `ctx.body`.

---

### ✨ Features
- ✅ Automatic per-route parsing
- ✅ JSON, form, multipart, text, binary, and newline-delimited formats
- ✅ Charset-aware decoding (`utf-8`, `utf-16`, etc.)
- ✅ File upload support with validation
- ✅ Fine-grained size limits and normalization options
- ✅ Works on all runtimes: Bun, Node, Workerd

---

### 🧬 Accessing Body Data
Once a request reaches your handler, TriFrost will already have parsed the body:
```typescript
r.post('/login', ctx => {
  const {username, password} = ctx.body;
  return ctx.json({ok: true});
});
```

Multipart and form bodies use the native `FormData` API:
```typescript
r.post('/upload', ctx => {
  const avatar = ctx.body.get('avatar');
  return ctx.text(`File received: ${avatar?.name}`);
});
```

---

### Type/Validation Support
Currently TriFrost does not yet provide a way to prevalidate your body payloads (except for byte size of course).

Our recommendation **for now** is to apply something like the following format:
```typescript
r.post('/data', async (ctx: Context<{name: string; age: number}>) => {
  if (!Validator.create({
    age: ['?', 'integer|between:1,150'],
    name: 'string_ne|min:2',
  }).check(ctx.body)) return ctx.setStatus(400);

  /**
   * Validator check acts as a type guard.
   * At this point ctx.body is typed as {name:string; age:number}
   */
  const {name, age = null} = ctx.body;
  ...
});
```

> You can obviously use any validation lib such as the amazing [Zod](https://zod.dev), and [Valibot](https://valibot.dev/) libraries.
> We're using the [ValkyrieStudios Validator](https://github.com/valkyriestudios/validator) here as it was created by the creator of TriFrost and plugs in nicely with TriFrost.

---

### 🛡️ Limits and Options
TriFrost provides sensible defaults:
- `4MB` global body limit
- Unlimited files (unless configured)

You can customize this globally or per-route.

##### Global Config
```typescript
new App()
  .bodyParser({
    limit: 4 * 1024 * 1024, // 4MB max
    json: {limit: 1024 * 1024}, // 1MB for JSON
    form: {
      limit: 2 * 1024 * 1024,
      files: {
        maxCount: 3,
        maxSize: 5 * 1024 * 1024,
        types: ['image/png', 'image/jpeg'],
      }
    }
  });
```

##### Per-Route Config
```typescript
r
  .bodyParser({
    form: {
      files: {
        maxCount: 1,
        types: ['image/svg+xml']
      }
    }
  })
  .post(ctx => {
    const logo = ctx.body.get('logo');
    return ctx.text(`SVG uploaded: ${logo?.name}`);
  });
```

---

### Oversized Payloads
If the body exceeds configured limits, TriFrost **automatically returns**:
```bash
413 Payload Too Large
```

No custom error handling required.

---

### Supported Content Types
- `application/json` → `{key: val}`
- `application/x-www-form-urlencoded` → `{key: val}`
- `multipart/form-data` → `{key: val}`
- `text/plain, text/html, application/xml, text/csv` → `{raw: string}`
- `application/x-ndjson` → `{raw: parsedLines[]}`
- Fallback: `Uint8Array` if unsupported or missing content-type

---

### Under the Hood
TriFrost’s parser uses:
- `TextDecoder` with fallback charset detection
- FormData normalization via [toObject()](https://github.com/ValkyrieStudios/utils/blob/main/lib/formdata/toObject.ts)
- Boundary-safe, streaming multipart parsing
- Size checks on every step with safe defaults

---

### TLDR
- `ctx.body` is always ready, no middleware required
- Works across all runtimes and content types
- Customize globally with `.bodyParser()` or per router/route
- Automatically handles charset, size, and file parsing
- Returns `413` for oversized requests

---

### Next Steps
- [Context & State Management](/docs/context-state-management)
- [Routing Basics](/docs/routing-basics)
- [Request Lifecycle](/docs/request-response-lifecycle)
- [Middleware Basics](/docs/middleware-basics)
- [Validation (Valkyrie Validator)](https://github.com/valkyriestudios/validator)
- [Zod](https://zod.dev)
- [Valibot](https://valibot.dev/)
- [FormData.toObject()](https://github.com/ValkyrieStudios/utils/blob/main/lib/formdata/toObject.ts)

The `Cors` middleware in TriFrost makes it easy to configure **Cross-Origin Resource Sharing (CORS)** — letting you control which origins, methods, and headers are allowed to interact with your API or frontend.

It’s built with **explicit configuration** — you define what’s allowed, and TriFrost sets the correct HTTP headers, no hidden magic.

---

### 📦 Import and Attach
```typescript
import {Cors} from '@trifrost/core';

...

.use(Cors(options))

...
```

You can apply it:
- **Globally** on the app
- **Per router**
- **Per route**

---

### ⚙️ Available Options
- `origin`: string | string[] | `(origin:string|null) => string|null`\nDefines allowed origin(s). Accepts a wildcard (`'*'`), a single origin, an array of origins, or a dynamic function.\n**default**: `'*'`
- `methods`: `'*'` | HttpMethod[]\nSpecifies which HTTP methods are allowed when the browser makes cross-origin requests.\n**default**: `['GET', 'HEAD', 'POST']`
- `headers`: string[]\nList of allowed request headers (**Access-Control-Allow-Headers**).\n**default**: `[]`
- `expose`: string[]\nList of headers exposed to the browser (**Access-Control-Expose-Headers**).\n**default**: `[]`
- `credentials`: boolean\nWhether to allow credentials (cookies, Authorization headers).\n**default**: `false`
- `maxage`: number\nAmount of seconds browsers can cache the preflight response.

These defaults are intentionally conservative. Configure them based on your security and functionality needs.

> **Note**:\n- **origin**: string[] automatically matches the incoming request’s origin — if it’s in the list, it’s allowed; otherwise, it’s rejected.\n- **maxage** must be a positive integer.\n- **methods** must be valid method names, TriFrost only accepts valid, uppercase HTTP methods.\n- Cors middleware is the **only middleware** that will be part of the middleware chain for `OPTIONS` requests.

##### Skipping Defaults
By default, TriFrost’s `Cors()` middleware applies **safe built-in defaults**, so you only need to override what you care about.

If you want to fully opt out of these defaults and only apply your own config, you can pass a second argument:
```typescript
app.use(Cors({
  origin: 'https://myapp.com',
  methods: ['DELETE']
}, {use_defaults: false})); // <- use_defaults = false
```

This will skip all internal defaults and apply only the values you provide.

For most cases, you should leave this flag as `true` (the default), but it’s available for power users who want fine-grained control.

---

### Examples
##### Allow all origins (public API):
```typescript
app.use(Cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
```

> Headers sent:
> Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, POST

##### Allow specific origins with an array:
```typescript
app.use(Cors({
  origin: ['https://site1.com', 'https://site2.com']
}));
```

> Dynamically matches request origin:
> Access-Control-Allow-Origin: https://site1.com (if matched)\nAccess-Control-Allow-Methods: GET, POST

##### Allow specific origin + credentials:
```typescript
app.use(Cors({
  origin: 'https://myapp.com',
  credentials: true
}));
```

> Headers sent:
> Access-Control-Allow-Origin: https://myapp.com\nAccess-Control-Allow-Methods: GET, HEAD, POST\nAccess-Control-Allow-Credentials: true

##### Allow dynamic origins (function):
```typescript
app.use(Cors({
  origin: (reqOrigin) => {
    if (reqOrigin === 'https://trusted.com') return reqOrigin;
    return null;
  }
}));
```

> Dynamically sets:
> Access-Control-Allow-Origin: https://trusted.com\nAccess-Control-Allow-Methods: GET, HEAD, POST

##### Allow additional headers + expose response headers:
```typescript
app.use(Cors({
  headers: ['X-Custom-Header', 'Authorization'],
  expose: ['X-Response-Time']
}));
```

> Headers sent:
> Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, HEAD, POST\nAccess-Control-Allow-Headers: X-Custom-Header, Authorization\nAccess-Control-Expose-Headers: X-Response-Time

##### Set max-age on preflight response:
```typescript
app.use(Cors({
  maxage: 600 // browsers cache preflight for 10 minutes
}));
```

> Headers sent:
> Access-Control-Allow-Origin: *\nAccess-Control-Allow-Methods: GET, HEAD, POST\nAccess-Control-Max-Age: 600

---

### Best Practices
- ✅ Use `origin: '*'` carefully — only for public APIs.
- ✅ Use dynamic `origin` functions if you need fine-grained control.
- ✅ Always set `credentials: true` if you’re using cookies or auth headers across origins.
- ✅ Keep `maxage` reasonable to reduce preflight requests but allow flexibility.

---

### Resources
- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [MDN: Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)
- [MDN: Access-Control-Allow-Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)

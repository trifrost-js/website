The `CacheControl` middleware in TriFrost helps you set explicit **HTTP Cache-Control headers** on your responses — making sure clients, proxies, and CDNs know exactly how to handle your content.

Whether you want to lock things down with `no-store` or lean into long-term `public` caching, this middleware gives you **direct, no-magic** control.

### 📦 Import and Attach
```typescript
import {CacheControl} from '@trifrost/core';

...

.use(CacheControl(options))

...
```

You can apply it:
- **Globally** on the app
- **Per router**
- **Per route**
- As a **cacheControl option** when responding through `ctx.html`, `ctx.file`, `ctx.text`, `ctx.json`

---

### ⚙️ Usage
App-wide:
```typescript
app.use(CacheControl(options));
```

-----

Router-wide:
```typescript
app.group('/static/*', router => {
  router
    .use(CacheControl(options))
    ...
})
```

-----

Single-Route:
```typescript
router.route('/assets/*', route => {
  route
    .use(CacheControl(options))
    ...
})
```

-----

As part of a response:
```typescript
app
  .get('/assets/:path', ctx => ctx.file(`/public/${ctx.state.path}`, {cacheControl: {...}}))
```

---

### ⚙️ Available Options
- `type`: `'no-cache' | 'no-store' | 'private' | 'public'`\nSets the primary caching directive.
- `maxage`: number\nSets `max-age` in seconds (e.g., 86400 = 1 day).
- `proxyMaxage`: number\nSets `s-maxage` in seconds (for shared caches like CDNs).
- `immutable`: boolean\nMarks the response as immutable (never changes).\n**default**: `false`
- `mustRevalidate`: boolean\nSignals that once stale, the cache must revalidate with the origin.\n**default**: `false`
- `proxyRevalidate`: boolean\nSignals that shared caches must revalidate once stale.\n**default**: `false`

> Note:\n- Only valid **type** values are accepted. Invalid strings are ignored.\n- **maxage** and **proxyMaxage** must be positive integers.

---

### Examples
##### Public static content, cache 1 day:
```typescript
app.group('/static/*', router => {
  router.use(CacheControl({
    type: 'public',
    maxage: 86400 /* 1 day */
  }));
});
```
> Header sent: `Cache-Control: public, max-age=86400`

##### Private user dashboard, no caching:
```typescript
app.group('/dashboard/*', router => {
  router.use(CacheControl({
    type: 'private',
    maxage: 0
  }));
});
```
> Header sent: `Cache-Control: private, max-age=0`

##### Immutable build assets, cache 1 year:
```typescript
app.group('/assets/*', router => {
  router.use(CacheControl({
    type: 'public',
    maxage: 31536000, /* 1 year */
    immutable: true
  }));
});
```
> Header sent: `Cache-Control: public, max-age=31536000, immutable`

##### CDN-specific shared cache control:
```typescript
app.group('/cdn/*', router => {
  router.use(CacheControl({
    type: 'public',
    maxage: 60,      /* browsers: 1 min */
    proxyMaxage: 600 /* shared caches: 10 min */
  }));
});
```
> Header sent: `Cache-Control: public, max-age=60, s-maxage=600`

##### Force revalidation on stale:
```typescript
app.group('/reports/*', router => {
  router.use(CacheControl({
    type: 'private',
    mustRevalidate: true
  }));
});
```
> Header sent: `Cache-Control: private, must-revalidate`

##### Using with ctx.file:
```typescript
app.get('/assets/:path', ctx =>
  ctx.file(`/public/${ctx.state.path}`, {
    cacheControl: {
      type: 'public',
      maxage: 86400 /* 1 day */
    }
  })
);
```
> Header sent: `Cache-Control: public, max-age=86400`

##### Using ctx.file with immutable long-term assets:
```typescript
app.get('/assets/build/:path', ctx =>
  ctx.file(`/public/build/${ctx.state.path}`, {
    cacheControl: {
      type: 'public',
      maxage: 31536000, /* 1 year */
      immutable: true
    }
  })
);
```
> Header sent: `Cache-Control: public, max-age=31536000, immutable`

---

### Best Practices
- ✅ Use `type: 'public'` + long `maxage` for static assets (CSS, JS, images).
- ✅ Use `type: 'private'` or `type: 'no-store'` for sensitive or user-specific content.
- ✅ Add `immutable` when you want caches to treat assets as forever fresh.
- ✅ Use `mustRevalidate` or `proxyRevalidate` if you need stricter revalidation control.
- ✅ Always be explicit — don’t leave caching behavior up to defaults.

---

### Resources
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [RFC 7234: HTTP/1.1 Caching](https://httpwg.org/specs/rfc7234.html)

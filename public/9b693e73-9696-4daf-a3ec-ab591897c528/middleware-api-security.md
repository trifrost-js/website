Web security is one of those areas where “forgetting just one header” can expose your app to attacks — **XSS, clickjacking, data leaks**, you name it.

That’s why TriFrost includes first-class `Security` middleware, inspired by tools like [helmet.js](https://helmetjs.github.io/), but tailored for the TriFrost ecosystem: runtime-agnostic, composable, and type-safe.

When you attach `Security()`, it automatically sets a range of security-related HTTP headers with **safe defaults**.

### 📦 Import and Attach
```typescript
import {Security} from '@trifrost/core';

...

.use(Security(options))

...
```

You can apply it:
- **Globally** on the app
- **Per router**
- **Per route**

---

### ⚙️ Available Options
- `contentSecurityPolicy`: TriFrostContentSecurityPolicyOptions|null\nConfigure allowed content sources (CSP).\n**default**: `null`
- `crossOriginEmbedderPolicy`: `'unsafe-none' | 'require-corp' | 'credentialless'` | null\nControl embedding of cross-origin resources.\n**default**: `null`
- `crossOriginOpenerPolicy`: `'unsafe-none' | 'same-origin-allow-popups' | 'same-origin'` | null\nControl cross-origin opener behavior.\n**default**: `'same-origin'`
- `crossOriginResourcePolicy`: `'same-site' | 'same-origin' | 'cross-origin'` | null\nRestrict cross-origin resource sharing.\n**default**: `'same-site'`
- `originAgentCluster`: boolean\nIsolate browsing context in an origin agent cluster.\n**default**: `true`
- `referrerPolicy`: `'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url'` | ReffererPolicy[] | null\nControl how much referrer info is sent.\n**default**: `'no-referrer'`
- `strictTransportSecurity`: {maxAge:number, includeSubDomains?:boolean, preload?:boolean} | null\nForce HTTPS and preload.\n**default**: `	{maxAge:15552000, includeSubDomains:true}`
- `xContentTypeOptions`: `'nosniff'` | null\nPrevent MIME type sniffing.\n**default**: `'nosniff'`
- `xDnsPrefetchControl`: `'on' | 'off'` | null\nControl DNS prefetching.\n**default**: `'off'`
- `xDownloadOptions`: `'noopen'` | null\nPrevent file downloads from opening automatically.\n**default**: `'noopen'`
- `xFrameOptions`: `'DENY' | 'SAMEORIGIN'` | null\nPrevent clickjacking (frame/iframe).\n**default**: `'SAMEORIGIN'`
- `xXssProtection`: `'0' | '1' | 'block'` | string | null\nLegacy XSS protection header.\n**default**: `'0'`

##### Defaults Summarized
If you attach `.use(Security())` without arguments, TriFrost sets these headers:

```typescript
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
```

Everything else (like **Content-Security-Policy**, **Cross-Origin-Embedder-Policy**) is disabled by default and only set if explicitly configured.

##### Skipping Defaults
By default, TriFrost’s `Security()` middleware applies **safe built-in defaults**, so you only need to override what you care about.

If you want to fully opt out of these defaults and only apply your own config, you can pass a second argument:
```typescript
app.use(Security({
  crossOriginOpenerPolicy: 'unsafe-none',
  xFrameOptions: null,
}, {use_defaults: false})); // <- use_defaults = false
```

This will skip all internal defaults and apply only the values you provide.

For most cases, you should leave this flag as `true` (the default), but it’s available for power users who want fine-grained control.

---

### CSP Nonce Injection
When using a `Content-Security-Policy` with `"'nonce'"` as a placeholder, TriFrost **will automatically generate and inject a secure, per-request nonce**, simplifying CSP compliance without manual coordination.

**Enable via CSP Config**
```typescript
app.use(Security({
  contentSecurityPolicy: {
    'script-src': ["'self'", "'nonce'"],
    'style-src': ["'self'", "'nonce'"],
  },
}));
```

At runtime, this produces:
```bash
Content-Security-Policy: script-src 'self' 'nonce-AbC123...'; style-src 'self' 'nonce-AbC123...'
```

##### Automatic JSX Integration
TriFrost’s JSX renderer fully supports nonce propagation:
- ✅ `ctx.nonce` is automatically assigned and stable per request
- ✅ You can access it via `ctx.nonce` or `nonce()` from `@trifrost/core`
- ✅ **No need to manually pass it** to TriFrost’s `<Script>` and `<Style>` components, they automatically apply the correct nonce.

Example (manual nonce use for custom tags):
```tsx
import {nonce} from '@trifrost/core';

export function AnalyticsBeacon() {
  return (
    <script nonce={nonce()}>
      {`navigator.sendBeacon('/beacon')`}
    </script>
  );
}
```

Example (TriFrost `<Script>` and `<Style>` primitives, no nonce needed):
```tsx
import {Script, Style} from '@trifrost/core';

export function Layout() {
  return (
    <html>
      <head>
        <Style /> {/* Automatically gets nonce */}
      </head>
      <body>
        ...
        <Script>{() => {
          console.log('Safe script execution');
        }}</Script> {/* Automatically gets nonce */}
      </body>
    </html>
  );
}
```

👉 Learn more in [JSX Basics](/docs/jsx-basics)

##### Inspecting the Nonce
You can log the nonce in any handler:
```ts
app.get('/debug', ctx => {
  return ctx.text('Nonce is: ' + ctx.nonce);
});
```

---

### Examples
##### Strict CSP for FrontEnd App

> 💡 **Tip:** Use `"'nonce'"` (as a string literal) in your `contentSecurityPolicy` config, TriFrost will replace it automatically with a secure, per-request value.

```typescript
app.use(Security({
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'nonce'", 'https://cdn.example.com'],
    'style-src': ["'self'", "'nonce'", 'https://fonts.googleapis.com'],
    'img-src': ['data:', '*'],
    'connect-src': ["'self'", 'https://api.example.com'],
    'font-src': ['https://fonts.gstatic.com'],
  },
}));
```

**What’s happening here**:
- Protects against inline scripts and unexpected external resources
- Allows known CDNs and APIs
- Script and style source get an automatic per-request nonce
- Still blocks everything else

##### Allow Framing Only on Trusted Origins
```typescript
app.use(Security({
  xFrameOptions: 'SAMEORIGIN',  // default, but explicit here
}));
```

If you want to embed your app inside specific external sites:
```typescript
app.use(Security({
  contentSecurityPolicy: {
    'frame-ancestors': ['https://trusted-partner.com'],
  },
  xFrameOptions: null,  /* disable legacy header in favor of CSP */
}));
```

**What’s happening here**:
- CSP `frame-ancestors` gives finer control than X-Frame-Options
- Avoids blocking your own integrations

##### API Server — No Framing, No Cross-Origin
```typescript
app.use(Security({
  xFrameOptions: 'DENY',
  crossOriginResourcePolicy: 'same-origin',
  crossOriginOpenerPolicy: 'same-origin',
}));
```

**What’s happening here**:
- Fully isolates the API
- Ensures no cross-origin embedding or data leaks
- Hardens server-side APIs

##### Public-Facing Static Site — Open Access, Locked Content Types
```typescript
app.use(Security({
  crossOriginResourcePolicy: 'cross-origin',
  crossOriginOpenerPolicy: 'unsafe-none',
  xContentTypeOptions: 'nosniff',
  strictTransportSecurity: {
    maxAge: 63072000,  // 2 years
    includeSubDomains: true,
    preload: true,
  },
}));
```

**What’s happening here**:
- Allows content to be served across origins (e.g., public CDNs)
- Still enforces MIME sniffing protections and HTTPS preload

##### Lock it down
```typescript
import {Security} from '@trifrost/core';

app.use(Security({
  contentSecurityPolicy: {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://trusted.cdn.com'],
    'style-src': ["'self'", 'https://trusted.cdn.com'],
    'img-src': '*',
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: ['no-referrer', 'strict-origin-when-cross-origin'],
  xFrameOptions: 'DENY',
}));
```

**What’s happening here**:
- Sets a strong CSP limiting scripts and styles to trusted sources.
- Enforces HTTPS with long max-age and preload (for HSTS).
- Denies all cross-origin frames.
- Blocks referrer data except on strict same-origin.

##### CSP Explained
```typescript
contentSecurityPolicy: {
  'default-src': "'self'",
  'script-src': ["'self'", 'https://cdn.com'],
  'style-src': "'self'",
  'img-src': '*',
  'connect-src': 'api.example.com',
  'frame-ancestors': "'none'",
}
```

This controls **which origins** your browser is allowed to load content from — preventing injected scripts, rogue iframes, and more.

Values can be:
- A single string (`'self'`)
- An array of strings (`["'self'", 'https://cdn.com']`)

---

### Best Practices
- ✅ Always set **Strict-Transport-Security** if you serve over HTTPS.
- ✅ Use **CSP** to block unexpected content, especially scripts.
- ✅ Use `"'nonce'"` literal in your CSP config to trigger injection
- ✅ Rely on `<Script>` and `<Style>` wherever possible, they’ll handle nonce automatically
- ✅ Use **X-Frame-Options** to prevent clickjacking.
- ⚠️ Avoid **X-XSS-Protection** unless supporting legacy IE.
- ✅ Review your **cross-origin policies** carefully.
- ✅ Log and monitor header behaviors in production.

---

### Resources
- [MDN: HTTP Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [Nonce Global Attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/nonce)
- [TriFrost JSX Basics](/docs/jsx-basics)

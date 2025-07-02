TriFrost’s cookie system lives on `ctx.cookies` — your all-in-one toolkit for reading, setting, signing, and deleting cookies across all runtimes.

No need to manually instantiate anything; the framework handles it for you. You just reach into `ctx.cookies` and go. It’s like a cookie jar that never runs out (unless you call `.delAll()` 😉).

---

### 📥 Reading Cookies
```typescript
ctx.cookies.get(name:string):string|null
```

Fetches a cookie by name from the incoming request and returns the **decoded value** or `null` if not found — no surprises, no crumbs left behind.

Example:
```typescript
const sessionId = ctx.cookies.get('session_id');
if (sessionId) {
  console.log('Welcome back, session:', sessionId);
} else {
  console.log('No session? No problem.');
}
```

---

### 📤 Setting Cookies
```typescript
ctx.cookies.set(
  name:string,
  value:string|number,
  options?:Partial<TriFrostCookieOptions>
):void
```

Adds a cookie to the outgoing response.

Available Options (**TriFrostCookieOptions**):
- `expires`: Date — When it should expire.
- `maxage`: number — Lifespan in seconds.
- `path`: string — URL path it applies to. (**default**: `'/'`)
- `domain`: string — Domain scope.
- `secure`: boolean — Lock it to HTTPS. (**default**: `true`)
- `httponly`: boolean — Keep it away from client-side JS. (**default**: `true`)
- `samesite`: `'Strict' | 'Lax' | 'None'` — Control cross-site behavior.

Example:
```typescript
ctx.cookies.set('session_id', 'abc123', {
  httpOnly: true,
  secure: true,
  maxage: 3600 /* 1 hour shelf life */
});
```

---

### 🗑️ Deleting Cookies
```typescript
ctx.cookies.del(name:string, options?:TriFrostCookieDeleteOptions)
ctx.cookies.del({prefix:string}, options?:TriFrostCookieDeleteOptions)
ctx.cookies.delAll(options?:TriFrostCookieDeleteOptions)
```

Sometimes you need to clear out the jar:
- `del(name)` — remove a specific cookie.
- `del({prefix})` — remove all cookies with a matching prefix.
- `delAll()` — wipe the slate clean

Available Options (**TriFrostCookieDeleteOptions**):
- `path`: string — Path scope when deleting. (**default**: `'/'`)
- `domain`: string — Domain scope for deletion. (**default**: app host (if set or known))

Example:
```typescript
ctx.cookies.del('session_id'); /* goodbye, session */

ctx.cookies.del({ prefix: 'temp_' }); /* clear all temp cookies */

ctx.cookies.delAll(); /* burn it all down (carefully) */
```

---

### 🔒 Signing Cookies
```typescript
await ctx.cookies.sign(
  value:string|number,
  secret:string,
  options?:TriFrostCookieSigningOptions
):Promise<string>
```

Signs a value using HMAC so you (and only you) can tell if it’s been tampered with.

Available Options (**TriFrostCookieSigningOptions**):
- `algorithm`: `'SHA-256' | 'SHA-384' | 'SHA-512'` — Algorithm to use. (**default**: `'SHA-256'`)

Example:
```typescript
const signed = await ctx.cookies.sign('userId42', ctx.env.COOKIE_SECRET);
ctx.cookies.set('session', signed);
```

Think of it like a wax seal on your data — except crypto-powered.

> Note: **HMAC** (Hash-based Message Authentication Code) ensures that even if someone sees the cookie, they can’t fake or modify it without knowing the secret key.
> This ensures that we can verify serverside that the value of a cookie **has not been tampered with**.

##### 🧰 Generate a secure HMAC secret:
```bash
npm create trifrost@latest
# → Choose: Security Keys → HS256 (or HS384/HS512)
```
Output:
```bash
SECRET="ZtFqM9TPeDp+Y0..."
```
Add to your projects' `.env` file and use as such.

👉 See [TriFrost Creation CLI](/docs/cli-quickstart) for more info

---

### 🔍 Verifying Signed Cookies
```typescript
await ctx.cookies.verify(
  signedValue:string,
  secretOrSecrets:string|Array<string|{val:string; algorithm?: 'SHA-256'|'SHA-384'|'SHA-512'}>,
  options?:TriFrostCookieSigningOptions
):Promise<string|null>
```

Checks if a signed cookie is valid and untampered.

Available Options (**TriFrostCookieSigningOptions**):
- `algorithm`: `'SHA-256' | 'SHA-384' | 'SHA-512'` — Algorithm to use. (**default**: `'SHA-256'`)

Example:
```typescript
const raw = ctx.cookies.get('session');
const verified = await ctx.cookies.verify(raw, ctx.env.COOKIE_SECRET);

if (verified) {
  console.log('Verified session:', verified);
} else {
  console.log('Uh-oh, invalid or tampered cookie.');
}
```

With multiple secrets (useful for example when doing key rotation):
```typescript
const verified = await ctx.cookies.verify(signed, [
    {val: 'newSecret', algorithm: 'SHA-512'},
    {val: 'oldSecret', algorithm: 'SHA-256'},
]);
```

---

### 🔍 Listing All Cookies
```typescript
ctx.cookies.all():Readonly<Record<string, string>>
```

Get a combined map of **all** cookies: incoming + outgoing. Great for debugging or cookie audits.

Example:
```typescript
const allCookies = ctx.cookies.all();
console.log('What’s in the jar?', allCookies);
```

---

### Best Practices
- ✅ Always set `httpOnly` + `secure` (default) for sensitive cookies to protect them from snoops.
- ✅ Use `ctx.env` or secret managers — **never hardcode secrets** in your codebase or Git.
- ✅ Sign important cookies so you know they weren’t tampered with.
- ✅ Clean up stale cookies when logging users out — don’t leave leftovers.
- ✅ Remember: **cookie names cannot contain** characters like `:`, `;`, or other HTTP token separators (per [RFC 6265](https://datatracker.ietf.org/doc/html/rfc6265)).
- ✅ Rotate secrets periodically and plan for fallback support.
- ✅ Use a randomly generated secret, at least **32–64 bytes (256–512 bits)**.
- 🚨 **Important**: Weak or reused secrets break the integrity guarantees of cookie signing and open you to tampering attacks.

---

### Resources
- [MDN: Using HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- [OWASP: Secure Cookie Guidelines](https://owasp.org/www-community/controls/SecureCookieAttribute)
- [Wikipedia: HMAC](https://en.wikipedia.org/wiki/HMAC)
- [RFC 6265: HTTP State Management Mechanism](https://datatracker.ietf.org/doc/html/rfc6265)
- [TriFrost Creation CLI](/docs/cli-quickstart)


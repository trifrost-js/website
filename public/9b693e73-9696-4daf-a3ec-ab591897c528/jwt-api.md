TriFrost includes first-class support for working with **JSON Web Tokens (JWT)**, with utilities designed for both **stateless authentication** and **runtime-agnostic crypto handling**.

Unlike external libraries that assume a specific runtime and work with specific runtime libraries, TriFrost’s JWT helpers are:
- Fully typed
- Lightweight
- Compatible with HMAC, RSA, and ECDSA
- Designed to run in Node, Bun, and Cloudflare Workers without modification

Whether you’re signing short-lived tokens for frontend clients or verifying RS256 tokens across services, these tools are built in, production-ready, and work everywhere TriFrost runs.

---

### Overview
TriFrost’s JWT support centers around three utility functions:
- `jwtSign(secret, options)`: signs a payload into a JWT
- `jwtVerify(token, secret, options)`: verifies a JWT’s signature and claims
- `jwtDecode(token)`: decodes a JWT **without verifying** it

Each is **zero-dependency**, relies on native **WebCrypto APIs**, and returns useful, structured data, or throws typed errors for clean handling.

---

### ✍️ Signing a JWT
```typescript
import {jwtSign} from '@trifrost/core';

const token = await jwtSign(ctx.env.SECRET, {
  subject: 'user-123',
  payload: {role: 'admin'},
  issuer: 'api-service',
  expiresIn: 3600, // 1 hour
});
```

Available Options (**JWTSignOptions**):
- `algorithm`: `'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512'`\nSigning algorithm\n**default**: `HS256`
- `issuer`: string\nIssuer claim (`iss`), string identifying the issuing entity (eg: `'api.trifrost.dev'`)
- `subject`: string\nSubject claim (`sub`), identifies the principal that is the subject of the JWT (eg: user id). **Take Note: Automatically gets coerced to string**
- `audience`: string|string[]\nAudience claim (`aud`), string or string array identifying the intended audience (eg: `'app.trifrost.dev'`)
- `expiresIn`: number|null\nSeconds until expiration (`exp`). Pass as null to not set expiry\n**default**: `3600`
- `notBefore`: number\nSeconds before which the token is not valid (`nbf`). Eg `60` = 1 minute
- `payload`: `Record<string, any>`\nCustom payload data to embed in the token. Eg `{"role":"user"}`
- `jwtid`: string\nUnique identifier for the JWT (`jti`). Particularly useful to protect against replay attacks by storing used ids and verifying
- `type`: string\nType of token (`typ` header field).\n**default**: `'JWT'`

---

### 🛡 Verifying a JWT
```typescript
import {jwtVerify} from '@trifrost/core';

const payload = await jwtVerify(token, ctx.env.SECRET, {
  algorithm: 'HS256',
  issuer: 'api-service',
});
```

Available Options (**JWTVerifyOptions**):
- `algorithm`: `'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512'`\nAlgorithm to be used for signature verification\n**default**: `HS256`
- `leeway`: number\nClock skew tolerance in seconds for `exp` and `nbf`.\n**default**: `0`
- `issuer`: string\nExpected issuer (`iss`) claim (eg: `'api.trifrost.dev'`)
- `subject`: `(val:string) => boolean`\nFunction to validate the subject (`sub`) claim. Take Note: This should purely do for example regex validation and is **not async**.
- `audience`: string|string[]\nExpected audience (`aud`) claim. Can be array of allowed audiences (eg: `'app.trifrost.dev'`)
- `type`: string\nExpected value of `typ` header field.\n**default**: `'JWT'`

Failure throws one of:
- `JWTMalformedError`
- `JWTTimeError`: expired / not yet valid
- `JWTClaimError`: issuer, audience, subject mismatch
- `JWTSignatureError`: bad signature
- `JWTAlgorithmError`: mismatch or unsupported
- `JWTTypeError`: invalid token type

These errors are **typed subclasses of** `JWTError` (which in turn extends from `Error`), so you can catch specific types or handle them generically.

---

### 👁 Decoding without verifying
```typescript
import {jwtDecode} from '@trifrost/core';

const tokenData = jwtDecode(token);
/* tokenData = {
  sub: 'user-123',
  role: 'admin',
  _header: { alg: 'HS256', typ: 'JWT' }
} */
```
This function simply **decodes and parses** the JWT’s header and payload. It does **not verify** signature, time, or claims, it’s **intended for inspection only**.

---

### ✅ Supported Algorithms
All of the below algorithms are supported and powered by native WebCrypto:

##### HMAC
HMAC (Hash-Based Message Authentication Code) is a symmetric cryptographic technique that uses a shared secret and a hash function to verify integrity and authenticity.

- Fast and simple
- Ideal for internal APIs or single-tenant systems
- **Requires shared secret to be kept private on both sides**

Supported:
- `'HS256'`: HMAC with SHA-256
- `'HS384'`: HMAC with SHA-384
- `'HS512'`: HMAC with SHA-512

> **Best Practice**: Use secrets that are at least as long as the hash output, for example 256 bits (32 bytes) for `HS256`.
> **Avoid short or guessable secrets**.
> Use a high-entropy string or randomly generated key (e.g. via `crypto.randomUUID()`).

**🧰 Generate a secure HMAC secret:**
```bash
npm create trifrost@latest
# → Choose: Security Keys → HS256 (or HS384/HS512)
```
Output:
```bash
SECRET="ZtFqM9TPeDp+Y0..."
```
Add to your projects' `.env` file and use as such:
```typescript
jwtSign(ctx.env.SECRET, { algorithm: 'HS256', ... });
```

👉 See [TriFrost Creation CLI](/docs/cli-quickstart) for more info

##### RSA
RSA is an asymmetric cryptographic algorithm using a public/private key pair. It is widely used and supported across platforms.

- Suitable for multi-party or federated environments
- Verifiers only need the **public key**
- Signers **must protect** the **private key**

Supported:
- `'RS256'`: RSA PKCS#1 v1.5 with SHA-256
- `'RS384'`: RSA PKCS#1 v1.5 with SHA-384
- `'RS512'`: RSA PKCS#1 v1.5 with SHA-512

> Key sizes: 2048 bits minimum (standard), 4096 bits recommended for RS384/RS512.

**🧰 Generate RSA keypair:**
```bash
npm create trifrost@latest
# → Choose: Security Keys → RS512 (or RS256/RS384) → 2048/4096 bits
```
Output:
```bash
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
```

Add to your projects' `.env` file and use as such:
```typescript
jwtSign(ctx.env.PRIVATE_KEY, { algorithm: 'RS256', ... });
jwtVerify(token, ctx.env.PUBLIC_KEY, { algorithm: 'RS256' });
```

👉 See [TriFrost Creation CLI](/docs/cli-quickstart) for more info

##### ECDSA
ECDSA (Elliptic Curve Digital Signature Algorithm) is an asymmetric algorithm known for smaller keys and fast verification.

- Smaller token size than RSA
- Efficient on constrained environments
- Requires curve-matching keys

Supported:
- `'ES256'`: ECDSA with P-256 curve and SHA-256
- `'ES384'`: ECDSA with P-384 curve and SHA-384
- `'ES512'`: ECDSA with P-521 curve and SHA-512

**🧰 Generate ECDSA keypair:**
```bash
npm create trifrost@latest
# → Choose: Security Keys → ES256 (or ES384/ES512)
```
Output:
```bash
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
```

Add to your projects' `.env` file and use as such:
```typescript
jwtSign(ctx.env.PRIVATE_KEY, { algorithm: 'ES256', ... });
jwtVerify(token, ctx.env.PUBLIC_KEY, { algorithm: 'ES256' });
```

👉 See [TriFrost Creation CLI](/docs/cli-quickstart) for more info

> All supported algorithms are powered by native WebCrypto, and key caching is handled automatically.

---

### Examples
##### Auth with BearerAuth
You can easily combine `jwtVerify()` with the built-in [BearerAuth](/docs/middleware-api-auth) middleware to protect routes with minimal code:
```typescript
import {jwtVerify, BearerAuth} from '@trifrost/core';

app.group('/api', router => {
  router
    .use(BearerAuth({
      validate: async (ctx, token) => {
        try {
          const payload = await jwtVerify(token, ctx.env.JWT_SECRET, {
            algorithm: 'HS256',
            issuer: 'api-service',
          });
          return {id: payload.sub, role: payload.role};
        } catch {
          return false;
        }
      }
    }))
    .get('/me', ctx => ctx.json({id: ctx.state.$auth.id}));
});
```
If `validate()` returns an object, it gets stored in `ctx.state.$auth` and is accessible downstream. Returning `false` short-circuits with a `401 Unauthorized`.

##### Asymmetric Auth with RS256
If you're using RS256 or other asymmetric schemes (e.g. public/private key pairs):
```typescript
import {jwtSign, jwtVerify} from '@trifrost/core';

/* Issue token */
const token = await jwtSign(ctx.env.PRIVATE_KEY, {
  algorithm: 'RS256',
  subject: user.id,
  payload: {role: user.role},
  issuer: 'auth-service',
  audience: 'client-app',
});

/* Verify later */
await jwtVerify(token, ctx.env.PUBLIC_KEY, {
  algorithm: 'RS256',
  issuer: 'auth-service',
  audience: 'client-app',
});
```

---

### Best Practices
- ✅ Use `ctx.env` for secrets — **never hardcode keys**.
- ✅ Always add `exp`, `aud`, and `iss` claims — don’t skip claim validation (`jwtVerify` handles this for you).
- ✅ Log and audit errors carefully.
- ✅ Prefer asymmetric keys (RS256/ES256) for distributed trust.
- ✅ Treat `jwtDecode()` as **unsafe** and only **for development**, unless followed by verification (`jwtVerify` internally also decodes).

---

### Resources
- [jwt.io](https://jwt.io/)
- [RFC 7519: JWT Spec](https://datatracker.ietf.org/doc/html/rfc7519)
- [OWASP: JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [TriFrost Auth Middleware](/docs/middleware-api-auth)
- [TriFrost Creation CLI](/docs/cli-quickstart)

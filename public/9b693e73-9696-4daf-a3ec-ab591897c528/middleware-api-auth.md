Authentication is one of the most common needs in web backends, and also one of the easiest to mess up.

That’s why TriFrost ships first-class auth middleware covering the most common patterns, with consistent behavior, minimal configuration, and **safe defaults**.

### Overview

All TriFrost auth middleware follow the **same shape**:
1. **Extract credential** (header, query, cookie, etc).\n2. **Run interval validation**, for example verify cookie, auth structure, etc.\n3. **Run your** `validate()` **function** to check against secrets, DBs, etc.\n4. **Attach to context** if valid, sets `ctx.state.$auth`.\n5. **Fail fast** if invalid, immediately short-circuits the chain and returns a `401 Unauthorized`.

This design gives you a consistent, composable auth pattern across all entry points.

---

### $auth object
The `$auth` object can be as simple or rich as you want — each middleware offers a `validate()` method which can return a boolean (`true` = valid) or a full object (object means valid).

This object is added to the state of the context and as such in addition to auth guarding your routes it can also enrich context for usage further down the line (for example, loading a session).

**Example, enriching $auth with a loaded user**:
```typescript
import {SessionCookieAuth} from '@trifrost/core';

app.group('/account', router => {
  router
    .use(SessionCookieAuth({
      cookie: 'session_id',
      secret: {val: ctx => ctx.env.SESSION_SECRET},
      validate: async (ctx, sessionId) => {
        const session = await ctx.cache.get('session:' + sessionId);
        if (!session) return false;

        const user = await ctx.cache.get<{
          name: string;
          email: string;
          settings: Record<string, unknown>
        }>('user:' + session.userId);
        if (!user) return false;

        return user;
      },
    }))
    .get('/profile', ctx => ctx.json({
      message: `Welcome back, ${ctx.state.$auth.name}`,
      email: ctx.state.$auth.email
    }))
    .get('/settings', ctx => ctx.json({
      settings: ctx.state.$auth.settings
    }))
});
```

**What’s happening here**:
- We attach `SessionCookieAuth` to the entire `/account` group.
- The `validate()` function does a lookup to check if the session and then user exists and returns either false or the user
- All subroutes (`/profile`, `/settings`, etc.) can now safely access `ctx.state.$auth`.

> **Note**: No extra checks are needed in downstream handler given that you only get into a handler guarded by auth middleware **if auth passes**.

---

### Supported Middleware

With zero extra dependencies you can currently drop in:
- [ApiKeyAuth](#apikeyauth): Api key authentication
- [BasicAuth](#basicauth): Basic username/password auth
- [BearerAuth](#bearerauth): Bearer token auth
- [SessionCookieAuth](#sessioncookieauth): HMAC-signed session cookie auth

Each middleware is:
- Easy to attach globally, per group, or per route (`app.use()`, `router.use()`, `route.use()`, etc.)
- Explicit: it extracts, validates, and attaches a clean `$auth` object to `ctx.state`
- Fail-fast: on auth failure, it **immediately** returns a `401 Unauthorized`, no extra checks needed

**Which one should you use?**
- [ApiKeyAuth](#apikeyauth): When external systems or services need to access your API with a static API key.
- [BasicAuth](#basicauth): When you want simple username/password access (often internal admin tools).
- [BearerAuth](#bearerauth): When working with OAuth, JWT, or third-party tokens.
- [SessionCookieAuth](#sessioncookieauth): When managing logged-in user sessions in a web app, tied to HMAC-signed cookies.

##### 🔑 ApiKeyAuth
The `ApiKeyAuth` middleware lets you protect routes using API keys passed in headers or query parameters.

**Options**
- `apiKey`: {header?:string; query?:string}\nWhere to extract the API key
- `apiClient` (optional): {header?:string; query?:string}\nWhere to extract the client or app identifier
- `validate(ctx, {apiKey, apiClient})`: function\nYour validation function. Return `true` (valid) or a custom object to inject into `$auth`; return `false` to reject.

> **Note**: If `validate` return `true` instead of an object the `$auth` object will be in the shape of `{apiClient:string, apiClient:string|null}`. You are expected to explicitly check both parts if you configure both.

Example:
```typescript
import {ApiKeyAuth} from '@trifrost/core';

app.group('/partner-api', router => {
  router
    .use(ApiKeyAuth({
      apiKey: {header: 'x-api-key'},
      apiClient: {header: 'x-api-client'},
      validate: async (ctx, {apiKey, apiClient}) => {
        const client = await myApiKeyStore.checkClientKeyPair(apiClient!, apiKey);
        if (!client) return false;

        return {
          clientId: apiClient,
          plan: client.plan,
          limit: client.limit,
        };
      }
    }))
    .limit(ctx => ctx.state.$auth.limit)
    .get('/data', ctx => ctx.json({
      client: ctx.state.$auth.clientId,
      plan: ctx.state.$auth.plan,
      message: 'Checked against rate limit and authenticated!',
    }));
});
```

**What’s happening here**:
- We explicitly configure both `apiKey` and `apiClient` headers.
- The `validate()` function checks the pair and returns enriched `$auth` context
- We make use of the `$auth` object for dynamic per-client [rate limiting](/docs/ratelimiting-api) using `.limit()`.
- Downstream routes can safely access all the enriched details.

> **Note:**: Remember to include your configured headers as **allowed headers** on [Cors](/docs/middleware-api-cors) if you are using `ApiKeyAuth` and [Cors](/docs/middleware-api-cors) on the same app.

##### 🧑‍💼 BasicAuth
The `BasicAuth` middleware uses HTTP Basic Auth headers to authenticate with username + password.

**Options**
- `realm`: string\nRealm label for `WWW-Authenticate` header.\ndefault: `'Restricted Area'`
- `validate(ctx, {user, pass})`: function\nYour validation function. Return `true` (valid) or a custom object to inject into `$auth`; return `false` to reject.

> **Note**:\n- On failure it returns `401 Unauthorized` as well as sets `WWW-Authenticate`.\n- If `validate` return `true` instead of an object the `$auth` object will be in the shape of `{user:string}`.

Example:
```typescript
import {BasicAuth} from '@trifrost/core';

app.group('/admin', router => {
  router
    .use(BasicAuth({
      validate: (ctx, {user, pass}) =>
        user === 'admin' && pass === ctx.env.ADMIN_SECRET
          ? {role: 'admin'}
          : false
    }))
    .get('/dashboard', ctx => {
      return ctx.json({
        message: `Welcome, ${ctx.state.$auth.role}!`
      });
    });
});
```

**What’s happening here**:
- We protect `/admin` with basic auth.
- Only `admin` + secret password is allowed.
- `$auth` contains `{role: 'admin'}`.

##### 🏷️ BearerAuth
The BearerAuth middleware authenticates requests using bearer tokens in the `Authorization` header.

**Options**
- `validate(ctx, token)`: function\nYour validation function. Return `true` (valid) or a custom object to inject into `$auth`; return `false` to reject.

> **Note**:\n- If `validate` return `true` instead of an object the `$auth` object will be in the shape of `{token:string}`.

Example:
```typescript
import {BearerAuth} from '@trifrost/core';

app.group('/protected', router => {
  router
    .use(BearerAuth({
      validate: async (ctx, token) => {
        /* Note: At time of writing TriFrost does not yet include a JWT module, but soon ... will ;) */
        const decoded = await verifyJwt(token, ctx.env.JWT_SECRET);
        return decoded ? {userId: decoded.sub, scopes: decoded.scopes} : false;
      }
    }))
    .get('/data', ctx => {
      return ctx.json({
        userId: ctx.state.$auth.userId,
        scopes: ctx.state.$auth.scopes
      });
    });
});
```

**What’s happening here**:
- We decode and validate the JWT token.
- If valid, we enrich `$auth` with the user + scopes.

##### 🍪 SessionCookieAuth
The `SessionCookieAuth` middleware authenticates requests using signed session cookies.

**Options**
- `cookie`: string\nName of the cookie holding the signed session value
- `secret`: {val, algorithm?}\nSecret used to verify HMAC signature. Accepts a string or a function returning a string.
- `validate(ctx, value)`: function (optional)\nAdditional validation after verifying the signature. Return `true` or an object to attach to `$auth`.

> **Note**:\n- If `validate` is not defined or returns `true` instead of an object the `$auth` object will be in the shape of `{cookie:string}`.

Example:
```typescript
import {SessionCookieAuth} from '@trifrost/core';

app.group('/account', router => {
  router
    .use(SessionCookieAuth({
      cookie: 'session_id',
      secret: {val: ctx => ctx.env.SESSION_SECRET},
      validate: async (ctx, sessionId) => {
        const session = await ctx.cache.get('session:' + sessionId);
        if (!session) return false;

        const user = await ctx.cache.get<{
          name: string;
          email: string;
          settings: Record<string, unknown>
        }>('user:' + session.userId);
        if (!user) return false;

        return user;
      }
    }))
    .get('/profile', ctx => ctx.json({
      message: `Welcome back, ${ctx.state.$auth.name}`,
      email: ctx.state.$auth.email
    }));
});
```

**What’s happening here**:
- We check the signed `session_id` cookie.
- If valid, we load the user and attach it to `$auth`.

---

### Best Practices
- ✅ Always store secrets (API keys, passwords, etc.) in `ctx.env` or a database — **never hardcode**.
- ✅ When enriching `$auth`, only pass what’s needed (avoid leaking sensitive details).
- ✅ Monitor + log failures carefully, but don’t expose sensitive info in responses.
- ✅ Use HMAC-signing (`SessionCookieAuth`) for sensitive info — **never trust client-side** blindly.
- ✅ Apply auth per route, group, or globally — TriFrost’s middleware chain makes this easy.
- ✅ Avoid mixing auth layers on the same route — pick one clear mechanism per entry point.
- ✅ Structure your `$auth` objects consistently to make downstream code simpler.
- ✅ Always validate tokens/sessions/keys with **authoritative sources** (not just local comparison).

---

### Resources
- [MDN: HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [MDN: HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#basic_authentication_scheme)
- [MDN: HTTP Bearer Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#bearer_authentication)
- [MDN: Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Swagger: Api Key Authentication](https://swagger.io/docs/specification/authentication/api-keys/)
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

TriFrost’s `create-trifrost` CLI helps you scaffold new projects in seconds — with a guided, interactive setup process designed to get you building immediately.

Whether you're targeting **Node**, **Bun**, or **Cloudflare Workers**, the CLI handles the boilerplate so you can focus on writing your app — not configuring it.

---

### ▶️ Quick Demo

Watch the CLI in action:
![QuickStart](/r2assets/trifrost-create.mp4)

---

### 📦 Installation & Usage

Use the CLI with your package manager of choice:
```bash
# NPM
npm create trifrost@latest

# BUN
bun create trifrost@latest
```

You'll be prompted to choose between:
```bash
? What are we creating today?
  ❯ TriFrost Project
    Security Keys (JWT/Cookie signing, etc)
```

---

### 🧱 Project Scaffolding
Choosing **TriFrost Project** walks you through:
- 🧠 Naming your service
- ⚙️ Selecting a runtime ([Bun](/docs/bun-runtime), [Node](/docs/nodejs-runtime), or [Cloudflare Workers](/docs/cloudflare-workerd))
- 🧩 Toggling middleware ([CORS](/docs/middleware-api-cors), [Security](/docs/middleware-api-security), [Rate Limit](/docs/ratelimiting-api), [Cache](/docs/cache-api), etc.)
- 💅 Adding [styling](/docs/jsx-style-system), [scripting](/docs/jsx-script-behavior), or [Atomic](/docs/jsx-atomic) setup
- 🐳 Optional Podman container support
- 🏗️ Fully scaffolded, install-ready structure

Once complete, you'll get:
```bash
✔ Created project in ./my-trifrost-app
👉 Next steps:
  cd my-trifrost-app
  bun dev
```

---

### 🔐 Generate Security Keys
Choosing **Security Keys (JWT/Cookie signing, etc)** lets you generate safe, production-ready secrets in `.env` format, no guesswork required.

**🔑 Supported Algorithms:**
- `HS256`, `HS384`, `HS512` HMAC (shared secret)
- `RS256`, `RS384`, `RS512` RSA (2048/4096-bit)
- `ES256`, `ES384`, `ES512` ECDSA (P-256, P-384, P-521)

Once complete, you'll get a `keys.env` file:
```bash
# HMAC
SECRET="ZtFqM9TPeDp+Y0..."

# RSA / ECDSA
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
```

These are ready to be dropped into your projects' `.env` file and loaded with:
```typescript
ctx.env.SECRET
ctx.env.PRIVATE_KEY
ctx.env.PUBLIC_KEY
```

Great for:
- 🔐 [JWT signing/verification](/docs/jwt-api)
- 🍪 [Cookie integrity](/docs/cookies-api)

---

### 🔧 Requirements

- **Node**: Node.js 20+
- **Bun**: [Bun](https://bun.sh/) installed
- **Cloudflare**: Node.js 20+
- **Containerized**: [Podman](https://podman.io) + Podman Compose installed
- **Security Keys**: [openssl](https://www.openssl.org/) (which should already be installed on most systems)

---

### 🤝 Contribute
Want to add new templates, features, or runtime support?

Check out [create-trifrost on GitHub](https://github.com/trifrost-js/create-trifrost) and open a PR or issue.

---

### Resources
- [Why TriFrost Exists](/news/blog/why_trifrost_exists)
- [TriFrost Core](https://github.com/trifrost-js/core)
- [TriFrost Creation CLI](https://github.com/trifrost-js/create-trifrost)
- [JWT Guide](/docs/jwt-api)
- [Cookies API](/docs/cookies-api)

TriFrost runs seamlessly on [Node.js](https://nodejs.org/en), the world’s most popular JavaScript runtime.

While not as flashy as [Bun](/docs/bun-runtime) or [Workerd](/docs/cloudflare-workers-workerd), Node offers battle-tested stability, a massive ecosystem, and rock-solid performance, a great choice for server-heavy, enterprise-grade applications.

This guide covers key setup notes, compatibility quirks, and best practices when running TriFrost on Node.

---

### Why Node.js?
Node gives you:
- 🌍 A massive ecosystem of npm libraries
- 🧱 Mature platform for production-grade systems
- 🔧 Fine-grained control over file system, streams, networking
- 🧪 Great compatibility with testing, observability, and CLI tools

TriFrost integrates smoothly with Node:
- Built-in runtime adapter
- Auto-detection
- Stream-based response model (no polyfills)

---

### Minimum Required Version
We recommend:
- ✅ **Node v22+** (ideal)
- 🔰 **Node v20+** (minimum supported)

Lower versions may lack support for:
- Native globals used by the TriFrost framework
- `stream/web` compatibility (used internally by TriFrost)
- Performance and diagnostic improvements

---

### Project Setup
TriFrost detects Node automatically, no runtime config needed.
```bash
npm install @trifrost/core
npm install -D typescript
```

Then in your app:
```typescript
import {App} from '@trifrost/core';

new App()
  .get('/', ctx => ctx.text('Hello from Node!'))
  .boot();
```

And in your `package.json`:
```json
{
  "scripts": {
    "dev": "npm run build && npm run dev:watch",
    "dev:watch": "tsc --watch & node --env-file=.env --watch ./dist/index.js",
    "build": "rm -rf ./dist && tsc -p ./tsconfig.json",
  }
}
```

👉 You can use `tsc` or `tsx`, both are supported. We recommend `tsc` for smooth local dev.

---

### Node-Specific Details
##### Automatic detection
TriFrost **detects Node automatically**, no runtime config needed.

##### TypeScript & JSX Support
Node does not support `.ts` and `.tsx` natively but TriFrost handles transpilation cleanly with `tsc`, and JSX is supported with the right config.

Your `tsconfig.json` should be set up with:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "jsxImportSource": "@trifrost/core",
    ...
  }
}
```

##### Scripts & Watch Mode
The CLI sets up this in your `package.json`:
```json
{
  "scripts": {
    "dev": "npm run build && npm run dev:watch",
    "dev:watch": "tsc --watch & node --env-file=.env --watch ./dist/index.js",
    "build": "rm -rf ./dist && tsc -p ./tsconfig.json",
  }
}
```

You get instant reloading with:
```bash
npm run dev
```

---

### Container Support (Optional)
TriFrost also supports [Podman](https://podman.io) for containerized Node development. If enabled during setup, it will:
- Scaffold a `Containerfile` with `node:alpine` base image
- Configure `compose.yml` with your app on a custom network
```bash
podman-compose up
```

This is useful if you want consistent environments across dev/prod.

---

### 🧪 Dev Tips
- Use `.env` files for local config
- Add `TRIFROST_DEV=true` in `.env` to enable dev-mode tracing

👉 Also see: [Dev Mode](/docs/utils-devmode) | [Environment Config](/docs/utils-envvars)

---

### Gotchas & Recommendations
- ✅ Make sure you're on **Node v20+**, earlier versions may lack needed stability for streaming, file serving, etc.
- 🛑 Be mindful of mixing CommonJS and ESM — Node supports both, but mixing them requires care.
- ✅ Prefer `npm install` for standard workflows. Node doesn’t manage a separate lockfile, your `package-lock.json` is used.
- 🧪 You can write tests with `vitest`, which integrates smoothly with Node and supports full ESM compatibility.
- ✅ JSX hydration is fully supported out-of-the-box with TriFrost's `client.css` and `client.script` if configured.

---

### 🔧 Generated Project Structure
A default Node.js project will include:
```bash
/src
  ├── index.ts          ← Entry point
  ├── routes/           ← Route handlers
  ├── components/       ← Layouts and JSX
  ├── css.ts            ← Styling system
  ├── script.ts         ← Scripting system
  ├── types.ts          ← Context/Env/Router types

/public
  ├── logo.svg
  ├── favicon.ico

Containerfile (optional)
compose.yml (optional)
eslint.config.mjs
tsconfig.json
package.json
package-lock.json
.env
.prettierrc
```

All routes and assets fully scaffolded by the [Creation CLI](/docs/cli-quickstart), no config needed.

---

### TLDR
- Node is ideal for stability, ecosystem access, and infrastructure-heavy apps
- TriFrost auto-detects Node, no config needed
- Use `tsc` + `node` for local dev and production readiness
- JSX and TypeScript fully supported with proper `tsconfig.json`
- You can opt into container support if desired

---

### Next Steps
- [App Class & Configuration](/docs/app-class)
- [Atomic Hydration](/docs/jsx-atomic)
- [Creation CLI](/docs/cli-quickstart)
- [Dev Mode](/docs/utils-devmode)
- [Environment Config](/docs/utils-envvars)
- [Hello World Example](/docs/hello-world-example)
- [JSX Basics](/docs/jsx-basics)
- [Logging & Observability](/docs/logging-observability)
- [Node](https://nodejs.org/)
- [Podman](https://podman.io)
- [Routing Basics](/docs/routing-basics)
- [Runtime: Bun](/docs/bun-runtime)
- [Runtime: Cloudflare Workers](/docs/cloudflare-workers-workerd)

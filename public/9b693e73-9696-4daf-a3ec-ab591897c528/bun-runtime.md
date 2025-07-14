TriFrost ships with **first-class support for** [Bun](https://bun.sh/), the fast, all-in-one JavaScript runtime. It’s a great choice for modern apps that prioritize **speed, native TypeScript**, and **tight feedback loops**.

This guide covers the key things to know when running TriFrost on Bun, including setup specifics, compatibility notes, and best practices.

---

### Why Bun?
Bun brings:
- ⚡ Blazing-fast startup and execution
- 🛠 Built-in support for TypeScript, JSX, and module resolution
- 📦 An integrated package manager (`bun install`)
- 🔁 Super-fast watch mode (`bun --watch`)

TriFrost taps directly into these benefits with:
- Native JSX + atomic hydration support
- Auto-detection
- Built-in Bun adapters (no polyfills needed)
- Instant dev feedback with `bun run dev`

---

### Installation & Hello World
You can scaffold a Bun-powered TriFrost project in seconds:
```bash
bun create trifrost@latest
```

Then choose:
- Runtime: `Bun`
- Optional modules: Cache, RateLimiter, Styling, etc.

Or create it manually:
```bash
bun add @trifrost/core
```
```typescript
import {App} from '@trifrost/core';

new App()
  .get('/', ctx => ctx.text('Hello from Bun!'))
  .boot();
```

👉 Learn more about the [Creation CLI](/docs/cli-quickstart)

---

### Bun-Specific Details
##### Automatic detection
TriFrost **detects Bun automatically**, no runtime config needed.

##### TypeScript & JSX Support
Bun supports `.ts` and `.tsx` natively. Your `tsconfig.json` should be set up with:
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

👉 You don’t need `tsc` to run your app, just `bun run`.

##### Scripts & Watch Mode
The CLI sets up this in your `package.json`:
```json
{
  "scripts": {
    "dev": "bun run --watch ./src/index.ts",
    "build": "rm -rf ./dist && bun build ./src/index.ts --outdir ./dist"
  }
}
```

You get instant reloading with:
```bash
bun run dev
```

---

### Container Support (Optional)
TriFrost also supports [Podman](https://podman.io) for containerized Bun development. If enabled during setup, it will:
- Scaffold a `Containerfile` with `oven/bun` base image
- Configure `compose.yml` with your app on a custom network
```bash
podman-compose up
```

This is useful if you want consistent environments across dev/prod.

---

### Dev Tips
- Use `.env` files for local config
- Add `TRIFROST_DEV=true` in `.env` to enable dev-mode tracing

👉 Also see: [Dev Mode](/docs/utils-devmode) | [Environment Config](/docs/utils-envvars)

---

### Gotchas & Recommendations
- ✅ Make sure you're on **Bun v1.1.10+**, earlier versions may lack needed stability for streaming, file serving, etc.
- 🛑 Avoid mixing CommonJS + ESM packages unless you know what you're doing, bun expects full ESM.
- ✅ Prefer `bun install` over `npm install`, bun manages its own lockfile (`bun.lockb`).
- 🧪 You can write tests with `bun test`, but for deeper testing we recommend `vitest` if needed (it also keeps your test logic agnostic in case you ever want to switch to lets say NodeJS).
- ✅ JSX hydration is fully supported out-of-the-box with TriFrost's `client.css` and `client.script` if configured.

---

### 🔧 Generated Project Structure
A default Bun project will include:
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
bun.lockb
.env
.prettierrc
```

All routes and assets fully scaffolded by the [Creation CLI](/docs/cli-quickstart), no config needed.

---

### TLDR
- Bun is a great choice for speed and dev velocity
- TriFrost has zero-config support for Bun’s runtime and APIs
- You can opt into container support if desired
- Everything is TypeScript and JSX native

---

### Next Steps
- [App Class & Configuration](/docs/app-class)
- [Atomic Hydration](/docs/jsx-atomic)
- [Bun](https://bun.sh/)
- [Creation CLI](/docs/cli-quickstart)
- [Dev Mode](/docs/utils-devmode)
- [Environment Config](/docs/utils-envvars)
- [Hello World Example](/docs/hello-world-example)
- [JSX Basics](/docs/jsx-basics)
- [Logging & Observability](/docs/logging-observability)
- [Podman](https://podman.io)
- [Routing Basics](/docs/routing-basics)
- [Runtime: NodeJS](/docs/nodejs-runtime)
- [Runtime: Cloudflare Workers](/docs/cloudflare-workers-workerd)

Let’s kick things off with a simple **Hello World** app — because every great framework deserves a smooth first dance.

We’ll walk you through the minimal setup to get a TriFrost app running locally.

---

### 🧭 Prefer a guided setup instead?
You can skip the manual steps and let the CLI scaffold everything for you, including runtime setup, middleware, styling, and more.

Run:
```bash
# Bun
bun create trifrost@latest

# NPM
npm create trifrost@latest
```

... and you’ll get a fully functional project in under a minute.

[▶️ See the CLI in action](/docs/cli-quickstart)

---

<RUNTIME>
<BUN>
### 📦 1. Install TriFrost
First, install the core package:
```bash
bun add @trifrost/core
```

### ✨ 2. Write Your First App
Create a file, for example, `server.ts`:
```typescript
import {App} from '@trifrost/core';

new App()
  .get('/', ctx => ctx.text('Hello TriFrost!'))
  .boot();
```

What’s happening here?
- We create a new TriFrost app.
- We define a **GET** route on `/` that returns a plain text response.
- We call `boot()` to start the server.

### 🚀 3. Run It
```bash
bun run server.ts
```

Then head to [http://localhost:3000](http://localhost:3000) in your browser. And you should see:
```
Hello, TriFrost!
```

Nice and clean.

### 4. Try Adding More Routes
Expand your app like this:
```typescript
/* Previous getter */
.get('/about', ctx => ctx.html('<html><body><h1>About page</h1></body></html>'))
.get('/json', ctx => ctx.json({ message: 'Hello, JSON world!' }))
/* Boot */
```

Restart your server, and now you have:
- `/about`: returns an html page
- `/json`: returns a JSON payload

### 5. Add a Dev Script
If you want to avoid restarting the server manually every time you make changes, you can run your app in **watch mode**.

Add a dev script to your package.json:
```json
{
  "scripts": {
    "dev": "bun run --watch ./server.ts"
  }
}
```

Now you can simply run:
```bash
bun run dev
```

And your server will automatically restart whenever you make code changes.
</BUN>
<NODE>
### 📦 1. Install TriFrost and tsx
First, install the core package:
```bash
npm install --save @trifrost/core && npm install --save-dev tsx
```

> [tsx](https://tsx.is/typescript) is a tool part of the typescript toolchain allowing you to execute typescript. At time of writing NodeJS does not yet (it's in the works though 🤌) have native typescript support. > In most examples (including the [TriFrost creation CLI](/docs/cli-quickstart)) we make use of the TypeScript compile **tsc**, however for sake of simplicity we're using tsx in this example.

### ✨ 2. Write Your First App
Create a file, for example, `server.ts`:
```typescript
import {App} from '@trifrost/core';

new App()
  .get('/', ctx => ctx.text('Hello TriFrost!'))
  .boot();
```

What’s happening here?
- We create a new TriFrost app.
- We define a **GET** route on `/` that returns a plain text response.
- We call `boot()` to start the server.

### 🚀 3. Run It
```bash
node --require tsx server.ts
```

Then head to [http://localhost:3000](http://localhost:3000) in your browser. And you should see:
```
Hello, TriFrost!
```

Nice and clean.

### 4. Try Adding More Routes
Expand your app like this:
```typescript
/* Previous getter */
.get('/about', ctx => ctx.html('<html><body><h1>About page</h1></body></html>'))
.get('/json', ctx => ctx.json({ message: 'Hello, JSON world!' }))
/* Boot */
```

Restart your server, and now you have:
- `/about`: returns an html page
- `/json`: returns a JSON payload

### 5. Add a Dev Script
If you want to avoid restarting the server manually every time you make changes, you can run your app in **watch mode**.

Add a dev script to your package.json:
```json
{
  "scripts": {
    "dev": "tsx watch ./server.ts"
  }
}
```

Now you can simply run:
```bash
npm run dev
```

And your server will automatically restart whenever you make code changes.
</NODE>
<WORKERD>
### 📦 1. Install TriFrost and wrangler
First, install the core package:
```bash
npm install --save @trifrost/core && npm install --save-dev wrangler
```

> [wrangler](https://developers.cloudflare.com/workers/wrangler/) is the **Cloudflare developer CLI**, particularly useful for local development as it provides, among others, the **workerd** runtime (upon which Cloudflare workers run, including the site you're reading this on).

### ✨ 2. Write Your First App
Create a file, for example, `server.ts`:
```typescript
import {App} from '@trifrost/core';

const app = await new App()
  .get('/', ctx => ctx.text('Hello TriFrost!'))
  .boot();

export default app;
```

As well as an accompanying `wrangler.toml` file (which is how we configure wrangler to our project):
```toml
name = "trifrost_website"
main = "server.ts"
compatibility_date = "2025-05-08"
compatibility_flags = ["nodejs_compat"]
```

What’s happening here?
- We create a new TriFrost app.
- We define a **GET** route on `/` that returns a plain text response.
- We call `boot()` to start the server.
- We export the app to ensure Workerd receives our fetch export.

> Note: In case you're flicking between the bun/node and workerd runtime examples you'll note there is a slight difference (hopefully one of the only ones 🥹) between **Node/Bun** and **Workerd**.
> **Workerd** expects a **global fetch handler** (the app handles the fetch handler internally) but we need to `export` our app using `export default app`.

### 🚀 3. Run It
```bash
npx wrangler dev
```

Then head to the URL wrangler provides you (which is usually [http://localhost:8787](http://localhost:8787)) in your browser. And you should see:
```
Hello, TriFrost!
```

Nice and clean.

### 4. Try Adding More Routes
Expand your app like this:
```typescript
/* Previous getter */
.get('/about', ctx => ctx.html('<html><body><h1>About page</h1></body></html>'))
.get('/json', ctx => ctx.json({ message: 'Hello, JSON world!' }))
/* Boot */
```

And now you have:
- `/about`: returns an html page
- `/json`: returns a JSON payload

> **Take Note:** `wrangler` automatically restarts your server for you :)
</WORKERD>
</RUNTIME>

That was easy right 😅? Welcome to TriFrost! There's a whole lot you can do as well as a whole lotta built-in bits and bobs we didn't touch on in this hello world example.

However, if you're excited about learning more, take a look at the [quick start](/docs/cli-quickstart) and **see a full-fledged project combining styling, jsx, scripting** (as well as the [TriFrost Atomic runtime](/docs/jsx-atomic)) in action.

### Next Steps
- Check out [Understanding Context](/docs/understanding-context) to learn how the request/response flow works.
- Jump into [Routing Basics](/docs/routing-basics) to explore dynamic routes and parameters.
- Explore [Middleware Basics](/docs/middleware-basics) to extend your app’s power.

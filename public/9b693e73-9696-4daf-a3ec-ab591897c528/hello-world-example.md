Let’s kick things off with a simple **Hello World** app — because every great framework deserves a smooth first dance.

We’ll walk you through the minimal setup to get a TriFrost app running locally.

---

### 📦 1. Install TriFrost
First, install the core package using your favorite package manager:
```bash
# Bun
bun add @trifrost/core

# NPM
npm install @trifrost/core

# PNPM
pnpm add @trifrost/core

# Yarn
yarn add @trifrost/core
```

### ✨ 2. Write Your First App
Create a file, for example, `server.ts`:
<RUNTIME>
<BUN>
```typescript
import {App} from '@trifrost/core';

new App()
	.get('/', ctx => ctx.text('Hello TriFrost!'))
	.boot();
```
</BUN>
<NODE>
```typescript
import {App} from '@trifrost/core';

new App()
	.get('/', ctx => ctx.text('Hello TriFrost!'))
	.boot();
```
</NODE>
<WORKERD>
```typescript
import {App} from '@trifrost/core';

const app = await new App()
	.get('/', ctx => ctx.text('Hello TriFrost!'))
	.boot();

export default app;
```
> Note: There is a slight difference (hopefully one of the only ones 🥹) between **Node/Bun** and **Workerd**.
> **Workerd** expects a **global fetch handler** (the app handles the fetch handler internally) but we need to `export` our app using `export default app`.
</WORKERD>
</RUNTIME>

What’s happening here?
- We create a new TriFrost app.
- We define a **GET** route on `/` that returns a plain text response.
- We call `boot()` to start the server.

### 🚀 3. Run It
<RUNTIME>
<BUN>
```bash
bun run server.ts
</BUN>
<NODE>
```bash
node --require tsx server.ts
```
> Ensure you have tsx installed as a dev dependency for this, if not the case `npm install --save-dev tsx`
</NODE>
</RUNTIME>

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
<RUNTIME>
<BUN>
```json
{
  "scripts": {
    "dev": "bun run --watch ./server.ts"
  }
}
</BUN>
<NODE>
```json
{
  "scripts": {
    "dev": "tsx watch ./server.ts"
  }
}
```
</NODE>
</RUNTIME>

Now you can simply run:
<RUNTIME>
<BUN>
```bash
bun run dev
```
</BUN>
<NODE>
```bash
npm run dev
```
</NODE>
</RUNTIME>

And your server will automatically restart whenever you make code changes.

### Next Steps
- Check out [Understanding Context](/docs/understanding-context) to learn how the request/response flow works.
- Jump into [Routing Basics](/docs/routing-basics) to explore dynamic routes and parameters.
- Explore [Middleware Basics](/docs/middleware-basics) to extend your app’s power.

---

That’s it — you’ve got a running TriFrost app!

Let’s keep building. 💪❄️

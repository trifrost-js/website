![TriFrost 1.0](/r2assets/trifrost_1_0.mp4)

In February 2024, I started building a new backend framework under the codename **Falcon**. No roadmap. No marketing. Just a lot of scratch notes and the constant feeling that everything else was heavier than it needed to be.

The idea was simple:
Build something **fast, typed, and runtime-agnostic**. No magic, no bundlers, no ceremony. Something that could run on Bun, Workers, Node, whatever.

I wasn’t trying to solve every problem.

I just wanted a tool that felt good to use.

---

### The Falcon Era 🦅
Falcon wasn’t public, but it moved fast. Between **February 2024** and **April 2025** (for those of you good at math ... that's a long time), I shipped **119 releases**, all in the 0.x range.

Routing got rewritten. Middleware got composable. The early JSX engine went from idea to working prototype.

In essence, I probably rewrote it 4 or 5 times in its entirety, always looking for **better dx**, **better performance**. Someone who I have to thank for some early sparring is Xander, the CTO of [Ask Donna](https://askdonna.com/), I was building the core of Donna's data architecture at the time while simultaneously (after hours) building out Falcon.

He probably doesn't realise it, but those early sparring sessions meant a lot to me. Thanks Xander!

Anyhow, by the time May 2025 rolled around, I’d renamed the project to **TriFrost**, a nod to the three pillars I kept returning to:
- **Type Safety**
- **Runtime Portability**
- **Performance**

And then I hit publish.

---

### Since Open Sourcing
Once TriFrost was public, I really started to stretch my legs on the project. There's a term often used in the gaming industry called "Crunch", which basically boils down to a long stretch of time doing intensive work to finish up on a game.

In the past two months and a half I have basically been in heads-down crunch mode for TriFrost:
- ✅ I’ve written **2500+ unit tests**
- 📘 Pushed **40+ long-form docs**
- 🎮 Built the [Atomic Arcade](https://arcade.trifrost.dev), a fully reactive, zero-bundle mini arcade featuring Tetris, Breakout and Snake
- 🛠 Created the [TriFrost creation cli](/docs/cli-quickstart)
- 🧪 Added real-world examples (not just counters)
- 🔐 Shipped built-in [Otel](/docs/logger-api), [JWT](/docs/jwt-api), [Auth middleware](/docs/middleware-api-auth), [TriFrost Atomic](/docs/jsx-atomic), a [styling system](/docs/jsx-style-system) and countless more features.
- 🧱 Rolled out the [trifrost.dev](https://www.trifrost.dev) site, built entirely from scratch with TriFrost
- 🧱 Created a markdown to JSX renderer (docs and blog needed it)
- 🔁 Published **54 minor releases** of [@trifrost/core](https://github.com/trifrost-js/core)
- ✍️ Wrote **12 blog posts**, excluding this one

Every piece of it: **built with TriFrost**, battle-tested by TriFrost.

---

### What 1.0 Means
This isn’t a “now it’s ready for production” kind of release. TriFrost has been production-ready for a while. What 1.0 means is that the **foundation is done**.

The core pieces: routing, middleware, runtime, JSX, styles, scripts, they’re all where they need to be. **And they’re stable**.

The docs are up. The API is consistent. The runtime is lean.

You can build full apps with it, right now, without needing to second-guess whether some corner is still experimental. You won’t find a “component compiler” here. No bundler lock-in. No hydration wrappers. Just code that renders, responds, and runs, ultra-fast.

---

### The Shape of TriFrost
Some quick facts, now that we're here:
- TriFrost SSR is **streamed, typed, and reactive**
- The **style engine shards** itself automatically on fragment render
- The **script engine** is VM-scoped and lifecycle-aware
- You get **realtime logging**, out of the box (and CSP-safe)
- The **Atomic Runtime** gives you pub/sub, scoped state, global stores, all without megabyte bundles
- The **serverside core** is blazing-fast, **faster than Hono, Elysia, Express or Koa**. Check out the [benchmark](/news/blog/hello_world_benchmark_trifrost)

If you’ve seen the Arcade, you’ve seen all of it in action.

There’s no React. No client router. Every route is just a fragment, loaded on demand, hydrated with a VM.

---

### End of the beginning
TriFrost 1.0 isn’t a capstone. It’s a checkpoint.

I’ve still got plenty to ship:
- Additional runtimes
- Additional examples
- Additional modules
- More blog posts (sorry, not sorry)
- ...

But this felt like the right moment to tag it.

The ideas are stable. The core is sharp. The tools are small, focused, and fast.

And the philosophy behind it all hasn’t changed:
> Do more with less.
> Don’t ship what you don’t need.
> Build things you want to use.

Thanks to everyone who’s tried it, starred it, broken it, or just sent a message (all 23 of you 🥹, you know who you are).

**TriFrost 1.0 is live.**

More coming soon. But for now, I’m off to build something with it 🚀.

Stay frosty ❄️

Peter

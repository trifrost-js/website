Finally got around to it.

The [TriFrost website](https://trifrost.dev), yeah, this one, is now **fully open source**.

Same routes, same deploy pipeline, same markdown engine, same "oh god why is this breaking in prod" debug traces.

If you're curious how TriFrost actually works in the real world, this is the place to be.

---

### 🧠 Why open source it?
Honestly? A few reasons:
- I want people to see **real TriFrost** in action — not a hello world.
- I don’t like frameworks that hide behind magic. This repo shows you everything: routing, styles, middleware, auth, streaming, storage.
- Docs are good, but real code is better.
- And maybe most of all: **frameworks should build with the same tools they ship**.

TriFrost isn’t just for other people, I use it daily, for this site and beyond.

So it felt wrong not to let others in.

And hey, it keeps me honest — if the examples page is half-done, you’ll see it. (It is.)

---

### 🧵 What’s under the hood?
- **TriFrost for everything**, routing, middleware, HTML rendering, style injection, streaming.
- **Cloudflare Workers** for prod deploys, **Node** and **Wrangler** for local dev.
- **GitHub Actions** deploys automatically on tag pushes.
- **DurableObjects** for caching.
- **Markdown-to-JSX** pipeline for docs/news — no hydration, no drama.
- **Neon (Postgres)** powers the news/blog/release content.
- **Uptrace** collects OpenTelemetry spans in prod.

Yes, every route is traced, you can see render timings, cache hits, status codes.

---

### 🔁 Releases are synced from GitHub
When I cut a release on GitHub, it hits a sync endpoint, fetches release data, processes the body, and dumps it into Neon.
That’s how the `/news/releases` section works — it’s dynamic, fast, and zero-maintenance.

Same goes for blog/news filtering. It’s all real data, streamed straight into server-rendered JSX.

---

### 📦 Where’s the repo?
- GitHub: [trifrost-js/website](https://github.com/trifrost-js/website)
- Live: [www.trifrost.dev](https://www.trifrost.dev)

Clone it. Steal patterns. PR something weird (not too weird though). All welcome.

---

### ⚠️ Not everything is polished
This site is a **work in progress**. Take a look at the examples code and you'll ... see what I mean.

But that’s the point. This is what building in public looks like.

Check back in a week, and something might be gone, or refactored, or rewritten entirely.

This is all **real**. It's not airbrushed.

---

Feel like contributing?

Or just poking around and see how things are wired together?

That's the whole point.

Thanks for reading, and for checking out TriFrost.

As always, stay frosty. ❄️

P.S. If you like what I'm building, [drop a ⭐ on GitHub](https://github.com/trifrost-js/core), it helps more than you think.

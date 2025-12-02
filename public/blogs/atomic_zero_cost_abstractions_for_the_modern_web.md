I’ve been quietly building a runtime system I wish had existed when I started building apps at scale, and **Atomic** is one of the pieces I’m most proud of.

It’s small. It’s sharp. It disappears when you look away. But when you need it, it's powerful in all the right places.

Let me walk you through what it is, why it exists, and where it's going.

---

## What is “Atomic”?
Atomic in TriFrost is a **zero-cost client runtime for styles and scripts** — a way to build interactive, styled UIs **without shipping redundant payloads, layout shift, or dead bundles**.

It’s part renderer, part compiler target, and part runtime engine.

Think of it like this:
- **Inline** `<style>` and `<script>` tags just work.
- They get **deduplicated**, **minified**, and **flushed** automatically.
- Global styles and client-side bindings are **hoisted** and **cached**.
- Need to add **CSP Nonces**? Add `'"nonce"'` to your csp and **done**, no hunting scripts down, no headaches.
- No client-side framework required.
- No virtual DOM.
- No bundle config.
- Just... HTML and logic. Declarative. Cacheable. Predictable.

And best of all, **it scales down to fragments and up to full apps**, without ever changing shape.

Just look at how clean it gets (example from the website you're reading this on):
```tsx
<button
  type="button"
  className={css.use('button', 'button_t_blue', 'button_s', {
    [css.media.desktop]: css.mix('hide'),
  })}
>
  Close
  <Script>{el => {
    el.addEventListener('click', () => el.$publish('newsfilter:close'));
  }}</Script>
</button>
```

---

## Why Atomic?
Most web frameworks treat hydration and styling like an afterthought, like a leak to be patched.

That never sat right with me.

I wanted a system that made:
- **Styles and logic co-located**, but never re-sent
- **Script content reference-safe**, even through bundlers
- **CSS fully deterministic**, never bloated or duplicated
- And **JS functions serializable**, but safe, debuggable, and **inline-able**

I didn’t want "less JavaScript". I wanted **smarter JavaScript**. Declarative, cacheable, atomic JavaScript.

---

## How Atomic Works
When you render a component, TriFrost:
- **Scans the JSX tree** for `<Script>` tags and `css.use`/`css.mix`
- **Hashes styles** into deterministic class names
- **Extracts scripts** into deduplicated registry entries
- Flushes a `<script>` that includes: Serialized data payloads (`TFD`), Hydration handlers (`TFF`), A tiny runtime (aka **atomic**) to connect the dots.

Every element gets exactly what it needs, nothing more.

Even better: if you pass your `createScript()` and `createCss()` instance, TriFrost will mount the shared runtime and root styles at `/__atomics__/client.js` or `/__atomics__/client.css` instead of inlining it.

That means your **entire global runtime becomes cacheable and CDN-stable**.

No layout shift. No duplication. No extra setup.

---

## What Makes It Different
- **You opt in per-element**. `<Script>` and `css()` are both locally scoped by default.
- **You can mount your runtime** globally, or not.
- **Bundler safe** — it preserves your source shape even with minifiers like esbuild.
- **SSR-first**, with hydration happening **only** where you declare it.

And critically: **no client runtime is ever forced on you**. TriFrost isn’t a JavaScript runtime framework, it's an engine that powers HTML.

Use whichever client-side framework you desire (Vue, React, Angular, ...), but know **TriFrost Atomic** exists in case you don't want to.

---

## The Future of Atomic
What’s coming next?

Gosh, a lot, but where our head is at, especially with 1.0 on the horizon, not making promises here, but the ability to customise atomic with your own methods that get bundled as shared logic would be swell.

Think something like this:
```typescript
createScript({
  atomic: {
    enabled: true,
    helpers: {
      drawBarChart: (...) => ...,
    },
  },
});
```

```tsx
<Script>{(el, data, $) => $.drawBarChart(el, data)</Script>
```

Eventually, I want **Atomic** to be something you forget exists, an optimizing fabric that lives below the surface.

Just write your components. Style and hydrate them inline. TriFrost figures out the rest.

---

It's a compiler. It's a cache layer. It's a client runtime. But really, personal opinion, but it feels like a better contract between your JSX and the browser.

Less ceremony. Less waste. More power.

If you haven’t tried it yet, render something with `<Script>` and `css()` today. See what disappears.

TriFrost will be here, doing the lifting.

Stay Frosty ❄️

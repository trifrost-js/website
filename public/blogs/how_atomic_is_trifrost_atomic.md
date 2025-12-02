When I started building TriFrost I had a couple of pillars I was working around (performant, portable, type-safe, etc), but also a guiding principle: **Do more with less.**

No compilers. No bundlers. No bloated clients. Just code that runs, and runs well, even in resource-constrained environments.

**TriFrost Atomic** is ... well the best way I can describe it ... a side-effect which grew out of this desire.

---

### 🌿 The Spirit of Atomic
Modern web tooling often feels like a baroque [Rube Goldberg machine](https://en.wikipedia.org/wiki/Rube_Goldberg_machine), preprocessors to feed bundlers, loaders to chain transpilers, CSS-in-JS just to get a red button.

I wanted something different:
- **No heavy bundling**
- **No compile step**
- **CSP-safe**
- **Out-of-the-box**

Atomic, in TriFrost, means two complementary things:
- **The CSS style engine**: sharded, fragment-friendly, nonce-aware.
- **The script runtime**: deterministic, isolated, and state-reactive

It’s built around a VM that **installs itself once**, and then exposes a lean global runtime.

You get full reactivity, scoped VM bindings, store propagation, and lifecycle-aware mounting, **without ever importing a framework runtime**.

The VM installs itself via frozen globals:
- `window.$tfr`: Relay pub/sub system
- `window.$tfdr`: Reactive data proxy
- `window.$tfs`: Shared store
- `window.$tfc`: Clock tick queue for batching reactive data changes
- `window.$tfutils`: Utility helpers like `eq`, `uid`, `sleep`, etc.

And each `<Script>...</Script>` element gets both the parent it wraps (`el`) as well as a reactive data proxy and the `$` trifrost utils provided to it.

It can go from simple clickers:
```tsx
<button>
    Click Me
    <Script>{({el, $}) => {
        $.on(el, 'click', () => alert('Hi!'));
    }}</Script>
</button>
```

To submitting forms and rendering fragments returned by the backend (the below is btw how the news filters work on the website):
```tsx
<form>
  <fieldset>
    <legend>Type</legend>
    <label><input type="radio" name="type" value="all" /> All</label>
    <label><input type="radio" name="type" value="blog" /> Blog</label>
    <label><input type="radio" name="type" value="release" /> Release</label>
  </fieldset>

  <fieldset>
    <legend>By Month</legend>
    <label><input type="radio" name="month" value="all" /> All</label>
    <label><input type="radio" name="month" value="2025-06" /> June 2025</label>
    <label><input type="radio" name="month" value="2025-05" /> May 2025</label>
  </fieldset>

  <Script data={{filters: {type: 'all', month: 'all'}}}>
    {({data, $}) => {
      data.$bind('filters.type', 'input[name="type"]');
      data.$bind('filters.month', 'input[name="month"]');

      data.$watch('filters', async () => {
        const res = await $.fetch<DocumentFragment>('/filter-news', {
          method: 'POST',
          body: data.filters,
        });

        if (res.ok && res.content) {
          document.getElementById('news-list')?.replaceWith(res.content);
        }
      });
    }}
  </Script>
</form>
<div id="news-list">{/* Server-rendered list gets replaced here */}</div>
```

Or, if you're fealing fancy, build entire animation components like this:
- [kickass synth background component](https://github.com/trifrost-js/website/blob/main/src/components/atoms/SynthBackground.tsx) at the bottom of every page on the website
- [shooting star effect](https://github.com/trifrost-js/website/blob/main/src/components/atoms/GridBackground.tsx) on the home page of the website

### ⚗️ CSP-Strict Ready
In a CSP-safe world, inline scripts can’t even touch `eval()` or `new Function()`. That’s why **TriFrost Atomic** emits all scripting instructions with:
- ✅ a valid nonce at SSR
- ✅ data attributes that hydrate partial fragments
- ✅ shared store access for deep integration

At runtime, the Atomic VM:
- Initializes the `data` and `$` utilities
- Boots the script inside the correct DOM node (`el`)
- Attaches lifecycle hooks (like `$mount()`, `$unmount()`, relay handlers like `$subscribe()`)

### 🧬 TriFrost Atomic + CSS Sharding = ❤️
While the scripting engine operates independently, it pairs beautifully with [recent changes regarding sharding behavior](/news/releases/0.42.0) in the **TriFrost style engine**, which emits either:
- a single `<style data-tfs-p>` block (which we internally call the **prime**) on full-page loads
- or sharded `<style data-tfs-s>` fragments for streamed / partial renders

An observer understands which shards already exist at runtime, when a new fragment is loaded up it merges unseen shards into a new shard block and discards those which were already on the page.

This prevents unnecessary DOM node buildup and is a perfect fit in combination with fragment-based server side rendering.

### So… How Atomic Is It?
All of this talk about how "fancy" and "great" Atomic is ... how atomic is it? Well, let’s let the numbers talk.

Looking at the Lighthouse Treemap for our `/news` route on the website:
- 130KB: External search script (DocSearch)
- **8.3KB**: TriFrost **Atomic runtime**
- ~4.5KB: All inline hydration + glue logic

That’s the entire dynamic reactivity system, style merging, relay, shared state, and DOM binding, ... **in less space than React’s development warnings**.

> ps: To anyone at **Algolia** reading this, even though it's a bit chunky, I ❤️ **DocSearch**

---

### Final Thoughts
TriFrost Atomic isn’t just an experiment. It’s proof that:
- You can build **modern, dynamic UIs without megabytes of JS**.
- You can deliver **full reactivity and lifecycle hooks** without a compiler.
- You can build for **strict environments**, with first-class **nonce propagation**.
- You can **think differently** about how much tooling you really need.

If you’ve ever been burned out by the weight of modern setups, or just want your code to ship the way you wrote it, you might find TriFrost Atomic surprisingly ... refreshing.

One tag. One VM. One idea: **small is beautiful**.

As always, stay frosty ❄️

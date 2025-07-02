TriFrost was built for progressive rendering. Whether you're building a streaming-first app, paginated content, or reactive filters, the framework embraces **fragments** as a first-class citizen.

This document gives you a small technical overview of:
- JSX fragments for partial HTML rendering
- Sharded styles that self-deduplicate
- Script hydration without reloading or replay issues

---

### 🧱 What’s a Fragment?
A **fragment** is any JSX render that returns **part** of the page, not a full `<!DOCTYPE html>` or `<html>`.

TriFrost treats these differently under the hood.
```tsx
// Server response
return ctx.html(
  <div class="card">...</div>
)
```

Because there's no root-level HTML, TriFrost automatically enters **fragment mode**, enabling:
- Sharded `<style>` injection (only what’s new)
- Deduplication of scripts/styles already on the page
- Safe CSP handling via `nonce`

This makes server-streamed updates (like filtered lists or infinite scroll) blazing fast and safe to hydrate.

---

### 🔁 How: Styles & Fragments
In fragment mode, rather than a single style node the CSS engine emits **shards**:
```html
<style data-tfs-s="tf87sdh1">.tf87sdh1{...}</style>
<style data-tfs-s="tf478923">.tf478923{...}</style>
...
```

At runtime, a tiny MutationObserver looks for these shards:
- If the style was already included in the page, it's skipped
- New shards are merged into a `<style data-tfs-ps>` block
- Shards are then removed from the DOM to keep things clean
- An internal list of **known shards on the page** then gets updated

This keeps your `<head>` tight, and your styles deduplicated, even if multiple fragments reference the same class.

---

### 🧠 How: Scripts & Fragments
Scripts in fragments behave exactly the same as those in full-page renders:
```tsx
<div id="news-list">{newsItems}</div>
<Script>{({el, $}) => {
  $.on(el, 'click', () => alert('Fragment loaded!'));
}}</Script>
```

They:
- Hydrate safely with per-request nonces
- Execute when inserted, not before
- Are atomic — no global event bus needed
- Co-locate behavior with DOM nodes

> 🧩 Note: On full-page renders, TriFrost injects the [Atomic Runtime](/docs/jsx-atomic) script, powering things like state binding, observability, and lifecycle control. On **fragment renders**, only the minimal inline scripts used by the fragment itself are included.

---

### ✨ Example: Filterable content
Here's a real-world example (from the news section on the website) where we're binding to form inputs to then load up an HTML fragment through a fetch call which replaces the currently loaded section.
```tsx
<form>
  <fieldset>
    <legend>Type</legend>
    <label><input type="radio" name="type" value="all" /> All</label>
    <label><input type="radio" name="type" value="blog" /> Blog</label>
    <label><input type="radio" name="type" value="release" /> Release</label>
  </fieldset>
  {/* We pass initial filter state to clientside */}
  <Script data={{filters: {type: 'all'}}}>
    {({data, $}) => {
      /* Bind our form inputs to the data proxy */
      data.$bind('filters.type', 'input[name="type"]');

      /* Watch for changes and send them to the backend */
      data.$watch('filters', async () => {
        /* $.fetch instantiates a document fragment for us */
        const res = await $.fetch<DocumentFragment>('/filter-news', {
          method: 'POST',
          body: data.filters
        });

        /* If all's good, replace our current news list with the content from the server */
        if (res.ok && res.content) {
          document.getElementById('news-list')?.replaceWith(res.content);
        }
      });
    }}
  </Script>
</form>
<div id="news-list">
  {/* Initial render — will get replaced when filters change */}
</div>
```

And on the server:
```tsx
export const handler = async ctx => {
  const {type} = ctx.body;
  const items = await getFilteredNews(type);

  return ctx.html(
    <div id="news-list">
      {items.map(entry => <NewsCard entry={entry} />)}
    </div>
  );
};
```

Result? Only the `#news-list` is swapped. Styles are reused. No flash. No rehydration mess.

---

### Best Practices
- ✅ Use `ctx.html(...)` without `<html>` to trigger fragment mode
- ✅ Co-locate `<Script>` inside components so hydration matches scope
- ✅ Always define `css` and `script` once, reuse across fragments
- ✅ Use per-element logic via `el`

---

### TLDR
- Fragments are first-class in TriFrost
- CSS and Script injection are shard-aware, nonce-safe, and deduped
- Use `DocumentFragment` + `<Script>` for dynamic UI updates
- Works beautifully for streaming, filters, pagination, and islands

---

### Next Up
Ready to learn more?
- Learn about [JSX Atomic Runtime](/docs/jsx-atomic) for reactivity, stores, global pubsub and more
- Need a refresher on [JSX Basics](/docs/jsx-basics)?
- Script your first interactive component with [createScript](/docs/jsx-script-behavior)
- Or explore [styling with createCss](/docs/jsx-style-system)

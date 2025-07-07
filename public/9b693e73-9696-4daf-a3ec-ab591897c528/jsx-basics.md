TriFrost’s JSX engine is designed from the ground up to enable **fast, secure, fragment-ready rendering** for modern server-side applications.

Whether you're building static pages, streaming fragments, or progressively enhancing UI, TriFrost gives you the full power of JSX, without heavy bundlers or framework runtimes.

No hydration wrappers. No giant JS payloads. Just HTML, with behavior when you need it.

This document covers the **basics** of using JSX with TriFrost, from setup to rendering, and introduces the primitives available to all JSX files.

> 🔐 TriFrost is fully **CSP-safe** out of the box, both scripts and styles are automatically assigned the correct nonce per request.
> 👉 Learn how to enable a [Content Security Policy](/docs/middleware-api-security)

---

### ⚙️ Setup
To enable JSX, configure your `tsconfig.json` with the compilerOptions set to this:
```json
{
  ...
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@trifrost/core"
  },
  ...
}
```

This tells TypeScript to compile JSX into calls compatible with TriFrost’s runtime-aware rendering system.

You’ll also want to define two shared files:
- `css.ts`: Creates and exports your app-wide `css` instance
- `script.ts`: Creates and exports your shared `Script` and `Module` components and `script` context helpers

```typescript
// css.ts
import {createCss} from '@trifrost/core';
export const css = createCss();
```

```typescript
// script.ts
import {createScript} from '@trifrost/core';
import {type Env} from './types.ts';
import {css} from './css';

const config = {
  atomic: true,
  css,
} as const;

export const {Module, Script, script} = createScript<typeof config, Env>(config);
```

Then go to your `App` and pass them as `client` options:
```typescript
import {App} from '@trifrost/core';
import {css} from './css';
import {script} from './script';

const app = new App({
  ...
  client: {css, script},
  ...
})
```

> 👉 Want a guided setup? Try the [TriFrost Creation CLI](/docs/cli-quickstart) and scaffold a project - batteries included - in seconds.

---

### 🚀 Rendering Pages
JSX in TriFrost compiles to strings and works seamlessly with `ctx.html(...)`:
```tsx
// routes/home.ts
import {Script} from '../script';
import {css} from '../css';

export const handler = async ctx => {
  return ctx.html(
    <html>
      <head>
        <title>Welcome</title>
      </head>
      <body>
        <h1>Hello World</h1>
        <button className={css({
          backgroundColor: 'white',
          color: 'black',
          [css.hover]: {backgroundColor: 'red', color: 'white'}
        })}>
          Click me
          <Script>{({el, $}) => {
            $.on(el, 'click', () => alert('Hi'));
          }}</Script>
        </button>
      </body>
    </html>
  );
};
```

TriFrost will handle:
- Script + style collection
- CSP nonce injection
- Deduplication
- Runtime hydration

It's just JSX, but server-native.

---

### 🧬 Context-Aware Helpers
The `script` object (from `createScript`) gives you access to the current rendering context:
- `script.env(key)`: ctx.env
- `script.state(key)`: ctx.state
- `script.nonce()`: (Though you shouldnt have to use this) The current CSP nonce

These utilities work without needing to pass `ctx` explicitly. This makes JSX trees easier to reuse and reason about.

> Of course, you can still pass the ctx into every component, but you shouldn't have to.

---

### 🪄 Behavior with <Script>
Want interactivity? Just drop a `<Script>` inline. It executes on the client-side once the DOM is ready and gives you full reactivity.

Like this simple clicker:
```tsx
<button>
  Click Me
  <Script>{({el, $}) => {
    $.on(el, 'click', () => alert('Hello'));
  }}</Script>
</button>
```

Or a more advanced clicker with data watching:
```tsx
<button>
  Click Me
  <Script data={{count: 0}}>
    {({el, data, $}) => {
      data.$watch('count', val => el.innerText = `Clicked: ${val}`);

      $.on(el, 'click', () => data.count++);
    }}
  </Script>
</button>
```

Scripts are atomic, isolated, nonced, and deduplicated.

---

### 💅 Scoped Styling
TriFrost also ships with a fully atomic, SSR-native CSS engine. Define styles via your shared `css.ts`.

And use your css instance wherever necessary to style however you want:
```tsx
import {css} from '../css';

export function MyFancyBox () {
  const box = css({
    padding: '1rem',
    backgroundColor: 'black',
    color: 'white',
    [css.hover]: {color: 'yellow'}
  });

  return <div className={box}>Hover me</div>;
}
```

Out of the box you get:
- Nesting
- Pseudo selectors (`:hover`, `:focus`, etc)
- Media queries via `css.media.*`
- Theming with `css.var` and `css.theme`
- Built-in dark vs light mode
- Reusable styles/definitions with `css.use()` and `css.mix()`

... and yes, even keyframe support like the [shooting star effect on our homepage](https://github.com/trifrost-js/website/blob/main/src/components/atoms/GridBackground.tsx)

---

### 🔁 Fragment-Ready by Default
One of TriFrost’s biggest strengths is how well it handles **progressive rendering** and **partial hydration**.

- CSS is sharded automatically for fragments
- `<Script>` tags work even inside streamed HTML
- Duplicate styles/scripts are skipped at runtime
- The atomic VM merges new shards on the fly

This makes it perfect for:
- Pagination
- Filter UIs
- Infinite scroll
- Multi-phase rendering

Here's a more full-fledged example (from the news section on the website) where we're binding to form inputs to then load up an HTML fragment through a fetch call which replaces the currently loaded section.
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
  {/* We pass the default state of our filters */}
  <Script data={{filters: {type: 'all', month: 'all'}}}>
    {({data, $}) => {
      /* Bind the specific form inputs to the data object, this ensures we listen to changes */
      data.$bind('filters.type', 'input[name="type"]');
      data.$bind('filters.month', 'input[name="month"]');

      /* Watch the filters leaf */
      data.$watch('filters', async () => {
        /**
         * On change submit the latest filters to a server side endpoint which returns html.
         * The $.fetch util automatically builds it into a DocumentFragment as well given that the server
         * returns HTML.
         */
        const res = await $.fetch<DocumentFragment>('/filter-news', {
          method: 'POST',
          body: data.filters,
        });

        /* If all is good, we replace our news list with the new filtered result */
        if (res.ok && res.content) {
          document.getElementById('news-list')?.replaceWith(res.content);
        }
      });
    }}
  </Script>
</form>
<div id="news-list">
  {/* Initial render, will get replaced when filters change */}
</div>
```

> 👉 Want a full breakdown? See [JSX Fragments](/docs/jsx-fragments)

---

### Best Practices
- ✅ Define and export `css` and `script` from shared modules (`css.ts`, `script.ts`)
- ❌ Don’t create new `createCss()` or `createScript()` instances per render. Define them once and pass them to your app as well.
- ✅ Use `script.env()`, `script.state()` instead of passing context manually
- ✅ Keep hydration logic inside `<Script>` blocks colocated with their element
- ✅ Keep global components inside `<Module>` blocks (such as modals, notification, etc)

---

### TLDR
- JSX compiles to strings, not VDOM
- Full server-first pipeline: nonce-aware, deduped, reactive
- Co-locate behavior with `<Script>`
- Style to your hearts content with `css()` from a shared instance
- Perfect for fragments and progressive UIs
- CSP-safe by default (both scripts and styles)

---

### Next Steps
Ready to learn more?
- Learn about [JSX Atomic Runtime](/docs/jsx-atomic) for reactivity, stores, global pubsub and more
- Take a technical dive into [JSX Fragments](/docs/jsx-fragments)?
- Script your first interactive component with [createScript](/docs/jsx-script-behavior)
- Or explore [styling with createCss](/docs/jsx-style-system)

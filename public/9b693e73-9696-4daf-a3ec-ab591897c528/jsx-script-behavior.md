TriFrost lets you attach client-side behavior directly inside your serverside JSX markup using `<Script>`. No bundlers, no hydration wrappers, no scope leaks.

It's **SSR-native**, **CSP-safe**, and supports **fine-grained interactivity without shipping full-page JS**. If you're used to React + client bundles, TriFrost scripting will feel both **simpler** and **more powerful**.

> 🔄 Scripts are server-rendered, but client-executed. Think of `<Script>` as a secure, typed replacement for `<script>` tags, scoped to the DOM node they’re written inside.
> ✅ Works with or without the [Atomic Runtime](/docs/jsx-atomic). Atomic adds reactivity, global state and utilities, but isn't required.

---

### 🧰 Defining Your Script System
Create your scripting engine using `createScript()` and place it in a shared file (e.g. our recommendation `script.ts`).
```typescript
// src/script.ts
import {createScript} from '@trifrost/core';
import {type Env} from './types';

type RelayEvents = {
  /**
   * These are the messages you can publish and subscribe to between VMs
   * See: JSX Atomic Runtime
   */
};

type StoreData = {
  /**
   * Global store keys accessible via $.storeGet / $.storeSet
   * See: JSX Atomic Runtime
   */
};

export const {Script, script} = createScript<
  Env, /* Env ensures that when you do eg script.env it is fully typed */
  RelayEvents,
  StoreData,
>({
  atomic: true /* Enables TriFrost Atomic reactivity + scoped utilities */
});
```

> ⚠️ You should only ever call `createScript()` once per environment. Define it in one file and reuse the exported `<Script>` and `script` across your app.
> 👉 RelayEvents/StoreData? Learn about these in the [TriFrost Atomic Runtime](/docs/jsx-atomic) doc

##### Type Safety
Just like with styling, TriFrost scripts are fully typed end-to-end:
- `data={...}` is strongly typed and inferred
- `el` is typed as `HTMLElement` (and some extensions if running on [TriFrost Atomic](/docs/jsx-atomic))
- Atomic `$` utilities are fully typed

```tsx
<Script data={{count: 1}}>{({data}) => {
  data.count.toFixed(); // ✅ type-safe
}}</Script>
```

This lets you build powerful UI without schema validation or runtime type-checking.

---

### 🚀 Registering in the App
To hydrate scripts, pass your instance to the app config:
```typescript
import {App} from '@trifrost/core';
import {css} from './css';
import {script} from './script';
import {type Env} from './types';

const app = new App<Env>({
  client: {css, script},
});
```

This ensures:
- Global styles are emitted at build time (`/__atomics__/client.css`)
- Per-request styles are injected automatically
- Tokens, themes, and resets are registered exactly once
- Nonces are automatically respected

You never need to call `script.root()` manually, TriFrost handles that automatically.

---

### 🧭 Prefer a guided setup instead?
You can skip the above manual steps and let the CLI scaffold everything for you, including runtime setup, middleware, styling, and more.

Run:
```bash
# Bun
bun create trifrost@latest

# NPM
npm create trifrost@latest
```

... giving you a fully functional project in under a minute.

[▶️ See the CLI in action](/docs/cli-quickstart)

---

### ✨ What is <Script>

The `<Script>` component is TriFrost’s universal way to attach logic to your HTML:

- ✅ Inline behavior via serialized function calls
- ✅ External script tags with full CSP/nonce support
- ✅ Built-in deduplication
- ✅ Optional **atomic reactivity** when using `createScript({atomic: true})`

👉 Learn about the [TriFrost Atomic Runtime](/docs/jsx-atomic) to craft reactive masterpieces.

---

### ⚙️ External Scripts
If you pass a `src` prop, the script is rendered as a normal `<script>` tag:
```tsx
<Script src="https://cdn.example.com/foo.js" defer />

// Renders as:
<script nonce="abc123" src="https://cdn.example.com/foo.js" defer></script>
```

All standard script attributes are supported (src, type, async, defer, ...), and the tag will be rendered directly into the HTML.

---

### 🧠 Inline Scripts
You can also use `<Script>` to bind behaviors directly to elements during hydration.
```tsx
<button type="button">
  Click Me
  <Script>{({el}) => {
    el.addEventListener('click', () => {
      alert('Clicked!');
    });
  }}</Script>
</button>
```

This script is serialized at render time, registered with a unique hash, and re-attached to matching DOM nodes on the client via `data-tfhf="..."`.

##### How: Hydration Model
TriFrost scripts **run only on the client**, but are defined alongside your markup on the server.

When JSX is rendered on the server, your script function is:
- Captured as a string
- Hashed and registered
- Injected into a hydration payload

On the client, this payload:
- Locates the target node (via `data-tfhf`)
- Re-attaches the function and invokes it with `{el, data, $}`

> 🧠 Your function **does not run during SSR**. It is serialized as code, not executed.

This means:
- You can write `el.addEventListener(...)` as if you were in a `<script>` tag
- You cannot access `ctx`, `request`, or anything server-bound inside `<Script>`
- `data` is your bridge from SSR to client

### What's passed to Script?
Each inline script receives:

**el: HTMLElement**
The DOM element the script is bound to.

```tsx
<div>
  <Script>{({el}) => { /* el here is the div */
    ...
  }}</Script>
</div>
```

**data: object**
The `data={...}` you passed to the script. Writable. Not reactive by default (unless Atomic is enabled).

🧬 Data is fully typed, TypeScript will infer the shape of your `data` object and reflect it in the script body.

Example:
```tsx
<div>
  <Script data={{count: 42}}>{({el, data}) => {
    /* data here is {count: 42} and auto-typed as {count:number} */
  }}</Script>
</div>
```

✅ This gives you end-to-end type safety from SSR → client, **without manual casts or schema validation**.

**$: Atomic Utils**
A set of scoped, DOM-safe utilities:
- `$.on`, `$.once`, `$.fire` for events
- `$.query`, `$.clear` for DOM traversal
- `$.storeSet`, `$.storeGet` for global store state
- `$.uid`, `$.eq`, `$.sleep`, `$.fetch`, etc.

```tsx
<button type="button">
  Click Me
  <Script>{({el, $}) => {
    $.on(el, 'click', () => alert('Clicked!'));
  }}</Script>
</button>
```

See [JSX Atomic Runtime](/docs/jsx-atomic) for the full list.

---

### ⚡ Instant Execution Scripts
When using `<Script>` with a **function that takes no arguments**, TriFrost optimizes it by **inlining the logic directly into the HTML**:
```tsx
<Script>{() => {
  console.log('Inline script ran immediately');
}}</Script>
```

This is:
- ✅ Instant: no need to wait for the script engine
- ✅ CSP-safe: nonce is automatically applied
- ✅ Great for meta-level logic, e.g. setting theme or firing analytics

> 💡 Think of this as a safer, scoped `<script>` tag, but written inline with full TypeScript support.

Under the hood, this produces:
```html
<script nonce="abc123">(function(){console.log("Inline script ran immediately")})();</script>
```

This behavior is **only enabled for scripts with no arguments**:
```tsx
<Script>{() => { ... }}</Script> // ✅ inlined
<Script>{({el}) => { ... }}</Script> // ❌ not inlined, handled via hydration
```
This means you get instant execution **only when no DOM binding is needed**, perfect for boot-time setup, cookie flags, or third-party hooks.

For example:
```tsx
/* Theme detection */
<Script>
  {() => {
    const saved = localStorage.getItem('theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved || preferred);
  }}
</Script>
```
```tsx
/* Locale detection */
<Script>
  {() => {
    const locale = navigator.language?.startsWith('fr') ? 'fr' : 'en';
    document.documentElement.setAttribute('data-lang', locale);
  }}
</Script>
```

---

### Examples
##### Class Toggle
Toggle a class on click:
```tsx
<Script>{({el}) => {
  el.addEventListener('click', () => {
    el.classList.toggle('active');
  });
}}</Script>
```
Whats happening here:
- You can bind this to any node, including SVG or custom elements.
- No framework bindings or runtime needed.

##### Toggle with Data
Track and mutate open state in-place:
```tsx
<div>
  <span>Toggle Visibility</span>
  <Script data={{open: false}}>{({el, data}) => {
    el.addEventListener('click', () => {
      data.open = !data.open;
      el.setAttribute('aria-expanded', String(data.open));
    });
  }}</Script>
</div>
```
Whats happening here:
- Uses data.open to track local state.
- Updates aria-expanded attribute accordingly.
- Great for dropdowns, modals, etc.

##### Debounce (Atomic)
```tsx
<Script>{({el, $}) => {
  $.on(el, 'input', $.debounce(() => {
    console.log('Typing stopped');
  }, 300));
}}</Script>
```
Whats happening here:
- Uses the `$.debounce()` utility
- Triggers only after user finishes typing

##### Reactive form (Atomic)
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

<div id="news-list">
  <!-- Server-rendered list gets replaced here -->
</div>
```
Whats happening here:
- `data`: Holds the form's reactive state (`filters.type`, `filters.month`)
- `data.$bind`: Connects `data.filters` keys to DOM input values
- `data.$watch`: Triggers whenever the filters change
- `$.fetch(...)`: Makes a POST request with current filters (the endpoint returns HTML)
- `res.content`: Replaces the news list with the updated HTML fragment

This pattern is great for:
- News/blog filtering
- Product category filters
- Interactive search UIs
- Pagination triggers

And is exactly how the news section filter on this website works 🤓

> Want another cool example? Check out this [Synth Background](https://github.com/trifrost-js/website/blob/main/src/components/atoms/SynthBackground.tsx) component (which is what you see if you scroll all the way down on this page on a desktop browser).

---

### 🛡 Security & CSP
TriFrost scripts:
- Respect `nonce` values from the context
- Scripts are safely serialized without `eval`
- Code and data payloads **are sandboxed** in an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to **prevent scope leakage**.

No runtime globals. No unsafe scopes.

---

### Best Practices
- ✅ Define script once with createScript()
- ✅ Co-locate behavior with elements

---

### TLDR
- Use `<Script>` to hydrate parent-node behavior
- Supports inline or external `src`-based scripts
- Automatically handles CSP nonces
- Dedupes scripts and data at render time
- Co-locates behavior with components
- Requires `createScript()` factory for proper typing (eg: environment, events, store, ...)
- 🚫 Don’t call `createScript()` multiple times, define it in `script.css` and pass to App.

---

### Next Steps
To become a true TriFrost-Samurai:
- Learn about [JSX Atomic Runtime](/docs/jsx-atomic) for reactivity, stores, global pubsub and more
- Need a refresher on [JSX Basics](/docs/jsx-basics)?
- Take a technical dive into [JSX Fragments](/docs/jsx-fragments)?
- Or explore [styling with createCss](/docs/jsx-style-system)

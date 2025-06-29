TriFrost supports **secure, efficient, and SSR-compatible scripting** directly within JSX via the `<Script>` component.

Unlike traditional frameworks that rely on global hydration roots or client bundles, TriFrost lets you **co-locate script logic** with markup, hydrate only what’s needed, and run per-node behaviors safely — all without sacrificing CSP, performance, or SSR correctness.

> 🔄 Scripts are server-rendered, but client-executed. Think of `<Script>` as a secure, typed replacement for `<script>` tags, scoped to the DOM node they’re written inside.

---

### ✨ What is <Script>

The `<Script>` component is TriFrost’s universal way to attach logic to your HTML:

- ✅ Inline behavior via serialized function calls
- ✅ External script tags with full CSP/nonce support
- ✅ Built-in deduplication
- ✅ Optional **atomic reactivity** when using `createScript({atomic: true})`

👉 Learn about the [TriFrost Atomic Runtime](/docs/jsx-atomic) to craft reactive masterpieces.

---

### 🔐 CSP-Aware by Default

If a `nonce` is present in the current context, TriFrost injects it automatically:

```tsx
<Script src="https://example.com/app.js" />

// Renders as:
<script nonce="abc123" src="https://example.com/app.js" />
```

No configuration required, the nonce is read from `ctx` during rendering and applied to all scripts.

This applies to **both external as well as inline scripts**.

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
You can also use <Script> to bind behaviors directly to elements during hydration.
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

##### 🔄 Understanding the Hydration Model
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

### 🧩 What's passed to Script?
Each inline script receives:

##### el: HTMLElement
The DOM element the script is bound to.

```tsx
<div>
  <Script>{({el}) => { /* el here is the div */
    ...
  }}</Script>
</div>
```

##### data: object
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

##### $: Atomic Utils
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

### 📦 Setup with createScript
You define your script system using `createScript()`:
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
  Env,
  RelayEvents,
  StoreData,
>({
  atomic: true // enables reactivity + scoped utilities
});
```

Then use across your app:
```tsx
import {Script} from '~/script';

export function Toggle() {
  return (
    <div>
      <span>Toggle state</span>
      <Script data={{open: false}}>{({el, data}) => {
        el.addEventListener('click', () => {
          data.open = !data.open;
          el.setAttribute('aria-expanded', String(data.open));
        });
      }}</Script>
    </div>
  );
}
```

> **Note**: Call `createScript()` **once** in your app. We recommend isolating it in a single file (our preference is `script.ts`).

> **Note**: 🧬 Want to learn how to broadcast and react to the `RelayEvents` and `StoreData` types?
> Dive into [JSX Atomic Runtime](/docs/jsx-atomic) for full `$watch`, `$fire`, and `$bind` support.

##### 🧠 App Integration
Pass your `script` (and optional `css`) into the `client` option during initialization:
```typescript
import {App} from '@trifrost/core';
import {script} from './script';
import {css} from './css';
import {type Env} from './types';

const app = await new App<Env>({
  client: {script, css},
  ...
}).boot();
```

This ensures:
- Scripts are **automatically registered** during SSR
- Nonces and hydration payloads are injected automatically
- You do **not need to call** `script.root()` manually in routes or components

---

### Examples
##### Click Handler
Attach a click event to a button element:
```tsx
<button type="button">
  Submit
  <Script>{({el}) => {
    el.addEventListener('click', () => {
      console.log('Submitted!');
    });
  }}</Script>
</button>
```
Whats happening here:
- Hydrates only that button.
- No global selectors or window pollution.
- Logs to console when clicked.

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

##### Event Relay (Atomic)
Requires `createScript({atomic: true})`:
```tsx
<button>
	Open Me
	<Script>{({el, $, data}) => {
	$.on(el, 'click', () => {
		$.fire(el, 'modal:open');
		$.storeSet('lastOpened', data?.id ?? 'unknown');
	});
	}}</Script>
</button>
```
Whats happening here:
- Publishes an event (modal:open)
- Writes to a global store key
- Event can be listened to by any other atomic VM on the page

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

##### Unmount cleanup (Atomic)
```tsx
<Script>{({el}) => {
  const timer = setInterval(() => {
    console.log('Tick');
  }, 1000);

  el.$unmount = () => {
    clearInterval(timer);
  };
}}</Script>
```
Whats happening here:
- TriFrost calls `$unmount` automatically when the node is removed.
- Avoids memory leaks in dynamic UI.

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

---

### Security Notes
- Scripts are safely serialized using a stringified function body (not `eval`)
- Data payloads are safely embedded via JSON.stringify with escaping
- Hydration code **is sandboxed** in an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) to **prevent scope leakage**.
- You should still audit for unsafe inline logic if CSP policies are strict

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
To become a true TriFrost-Samurai, learn how to:
- Enable **fine-grained reactivity and state binding** with [JSX Atomic Runtime](/docs/jsx-atomic)
- Style to your hearts content with [TriFrost Styling System](/docs/jsx-style-system)

TriFrost's Atomic Runtime gives you **fine-grained reactivity, scoped state, lifecycle awareness**, and **safe interop** with the DOM, all SSR-first and CSP-safe.

It extends the [<Script>](/docs/jsx-script-behavior) hydration model with a tiny (~8KB) runtime and per-node VMs.

The result? Island-level interactivity that composes, without client bundles.

> 💡 Read the blog: [How Atomic is TriFrost Atomic](/news/blog/how_atomic_is_trifrost_atomic)

---

### What Atomic adds
When you pass `atomic: true` to `createScript()`, every `<Script>` and their parent node gains:
- An isolated VM instance ID (`el.$uid`)
- Scoped pub/sub (`el.$publish`, `el.$subscribe`, ...)
- Reactive `data` proxy (`data.$watch`, `data.$set`, `data.$bind`)
- Lifecycle hooks (`el.$unmount`, `el.$mount`)
- Global store access (`$.storeSet`, `$.storeGet`, with reactive broadcasts)
- Access to the Atomic utils (`$.fire`, `$.on`, `$.fetch`, ...)
- Typed module access (`$.modal.open()`, `$.audio.play()`, ...) via the `Module(...)` factory + `createScript({modules})`

It's like a mini reactive runtime baked directly into your DOM tree.

---

### Runtime Footprint
When enabled:
- Adds **~8KB** static runtime (served once, cached forever)
- Injects **~100-200B** glue logic on a page with scripts

It’s faster, smaller, and safer than client frameworks.

---

### ✨ el Additions
With atomic enabled, each hydrated node (`el`) becomes a full VM host:
```tsx
<Script>{({el}) => {
  console.log(el.$uid);        // unique vm id
  el.$unmount = () => {};      // cleanup logic
  el.$publish('some:event');   // broadcast
  el.$subscribe('some:event', (val) => ...); // listen
}}</Script>
```

Each `el` now has:
- `el.$uid`: Deterministic ID
- `el.$unmount`: Called automatically when removed from DOM
- `el.$mount`: Called automatically once VM node has been instantiated
- `el.$subscribe(topic, fn)`: Method allowing you to subscribe to a topic on the pubsub relay
- `el.$subscribeOnce(topic, fn)`: Method allowing you to subscribe to a topic on the pubsub relay with automatic unsubscribe once triggered
- `el.$unsubscribe(topic)`: Method allowing you to unsubscribe from a specific topic on the pubsub relay
- `el.$publish(topic, data)`: Method allowing you to publish data to a specific topic on the pubsub relay
- Automatic integration with mutation observers and relay system
- `$.<module>`: Automatically injected when referenced in a `<Script>`, providing typed access to registered modules

> 💡 To register teardown logic for a dynamic element (e.g., created in a module), use `el.$unmount = () => { ... }`. This will automatically run when the element is removed from the DOM.

##### Scoped Pub/Sub Relay
Every atomic script runs inside an isolated VM that can **communicate across nodes** using scoped [pub/sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) messages.
```tsx
<Script>{({el}) => {
  el.$subscribe('filters:open', (val) => console.log('opened?', val));
  el.$publish('filters:open', true);
}}</Script>
```

These relay messages are:
- Fully isolated per page render
- Strongly typed via global `AtomicRelay` interface
- Automatically cleaned up on unmount

**Relay Typing**:
Each component can extend the global `AtomicRelay` with its own available messages:
```tsx
type FilterEvents = {
  'filters:open': boolean;
}

declare global {
  interface AtomicRelay extends FilterEvents {}
}

function MyFilters () {
  return <div>
    ...
    <Script>{({el}) => {
      ...
      el.$subscribe('filters:open', (val) => {
        val.toFixed(); // ❌ Error (val is boolean)
      });
      ...
    }}</Script>
  </div>;
}
```

**Cross-Component Pub/Sub Example:**
```tsx
{/* Component A */}
type ModalEvents = {
  'modal:open': void;
  'modal:close': void;
}

declare global {
  interface AtomicRelay extends ModalEvents {}
}

<Script>
  {({el}) => {
    el.$subscribe('modal:open', () => {
      el.classList.add('show');
    });
  }}
</Script>

{/* Component B */}
<Script>
  {({el}) => {
    const btn = el.querySelector('button');
    btn?.addEventListener('click', () => {
      el.$publish('modal:open');
    });
  }}
</Script>
```
Here, `Component B` opens `Component A`, without needing props, context, or DOM queries. Both scripts remain colocated and isolated.

> 💡 Relay is broadcast-style — anyone can publish, and any other `<Script>` VM can listen.

**Want to target just a parent?**
Use `$.fire(el, type)` to dispatch a DOM event to just the parent.
```tsx
{/* Inside a child component */}
<Script>
  {({el, $}) => {
    $.fire(el, 'custom:action', {data: {foo: 123}});
  }}
</Script>

{/* Inside a wrapping component */}
<Script>
  {({el}) => {
    el.addEventListener('custom:action', (e) => {
      console.log('Child wants to do something:', e.detail);
    });
  }}
</Script>
```
Unlike relay, `$.fire(...)` walks the DOM tree either up (default) or down. Perfect for scoped signals without global subscriptions.

Combined with the global store (below) and `AtomicRelay/AtomicStore` typing (also below), this gives you safe reactive messaging across the page.

##### 🌐 Global Store
TriFrost Atomic includes a global reactive store:
- Write with `$.storeSet('key', value)`
- Read with `$.storeGet('key')`
- Listen with `el.$subscribe('$store:key', handler)`

This store is:
- Fully reactive
- Deeply typed (via `AtomicStore`)
- Automatically hydrated from localStorage

**Usage:**
```tsx
<Script>{({el, $}) => {
  $.storeSet('theme', 'dark', {persist: true});
  const theme = $.storeGet('theme'); // 'dark'

  el.$subscribe('$store:theme', (val) => {
    el.setAttribute('data-theme', val);
  });
}}</Script>
```

**Behavior:**
- Setting a key emits `$store:key` event
- Deleting a key emits `$store:key` with `undefined`
- Persisted keys auto-hydrate on load (prefixed via `$tfs:`)

**Persistence Example:**
```typescript
$.storeSet('locale', 'en', {persist: true});
```

Store changes **automatically emit relay events**:
```tsx
$.storeSet('locale', 'en');
// Will auto trigger: el.$subscribe('$store:locale', ...)
```

Store values are deeply typed:
```tsx
const theme = $.storeGet('theme'); // Type: 'light' | 'dark'
```

This provides lightweight global coordination with zero globals.

**Store and Relay Together:**
```tsx
{/* Somewhere in Component A */}
<Script>
  {({el}) => {
    el.$subscribe('$store:theme', (val) => {
      console.log('Theme changed:', val);
      el.setAttribute('data-theme', val);
    });
  }}
</Script>

{/* Somewhere else in Component B */}
type StoreData = {
  theme: 'dark' | 'light'
};

declare global {
  interface AtomicStore extends StoreData {}
}

<Script>
  {({$}) => {
    $.storeSet('theme', 'dark'); // triggers A's listener
  }}
</Script>
```

This demonstrates:
- How store changes act like global pub/sub
- That VMs can subscribe to store changes as if they were events

##### 🔐 Global Contracts: AtomicRelay & AtomicStore
TriFrost uses **global ambient interfaces** for all relay/store typing.

There are currently two of these **ambient interfaces** available:
- `AtomicRelay`: type contract for `$publish` and `$subscribe`
- `AtomicStore`: type contract for `$.storeGet`, `$.storeSet`, and `$.storeDel`

This means:
- No passing around and importing of Event or Store types
- No manual unions
- Autocomplete works everywhere

These interfaces are available globally inside every `<Script>` **block or registered Module**, with no need to import or union types manually.

Let’s say your `Game` component defines its own events and store shape. By extending the ambient interfaces below, these types become globally available to all `<Script>` **and Module instances**, no imports needed:
```ts
// types.ts or within your component file
type GameEvents = {
  'game:evt:boot': void;
  'game:evt:countdown': void;
};

type GameStore = {
  gameConfig: {
    music: 'on' | 'off';
    difficulty: 'beginner' | 'intermediate' | 'expert';
  };
};

declare global {
  interface AtomicRelay extends GameEvents {}
  interface AtomicStore extends GameStore {}
}
```

✅ Each component or module can **extend the global AtomicRelay and AtomicStore types**. These declarations become ambiently available inside all `<Script>` **blocks and registered Modules**. No imports needed.

```tsx
<Script data={{ evtStart: 'game:evt:boot' as keyof AtomicRelay }}>
  {({ el, data, $ }) => {
    el.$subscribe(data.evtStart, () => {
      const music = $.storeGet('gameConfig').music;
      el.$publish(music === 'on' ? 'audio:play' : 'audio:pause');
    });

    el.$publish('game:evt:countdown');
  }}
</Script>
```

You get:
- 🔒 Strong typing for all `$.store*` and `$publish/$subscribe` calls
- 🚫 No manual unions or generics required
- ⚡ Fully typed `keyof AtomicStore` and `keyof AtomicRelay` autocomplete in any script/module
- ✅ Zero runtime cost

> 🧠 **Why this matters**
> This reduces ceremony, avoids repetition, and ensures consistent typing across your entire atomic runtime. It keeps your relay/store contract global, type-safe, and frictionless.

> 💡 **Modular by Design  **
> Since every component can safely extend `AtomicRelay` or `AtomicStore`, event and store contracts stay colocated,  without requiring a central registry or union types.

---

### ⌚ Reactive data Proxy
When atomic is enabled, the `data` object that you pass to your `<Script>` instances is elevated and automatically upgraded into a reactive proxy:

```tsx
<Script data={{count: 1}}>{({data}) => {
  data.$watch('count', (val) => console.log('Count:', val));

  data.$set('count', 5); // reactive
}}</Script>
```

You can:
- Call `$set(path, value)` for granular updates, or pass a full object for deep merges, or pass a path and an object for leaf merges
- Use `$watch(path, handler)` to respond to changes. The handler receives `(newVal, oldVal)`
- Bind data to DOM with `$bind(path, selector)` or `$bind(path, selector, watcher)` to bind **and** watch in one line

- `$set(path, val)` or deep-merge objects with `$set(val)`
- `$watch(path, fn)` to subscribe to changes. The watcher fn has the following signature arguments `(newVal, oldVal)`
- `$bind(path, selector)` to two-way bind to inputs, or `$bind(path, selector, watcher)` to combine a bind and watch in a single line

Everything is:
- Deeply typed (with your own `data` shape)
- Scoped to the current node
- Automatically cleaned up on DOM removal

Example form binding + backend update:
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
      /* Two-way bind radios with data proxy */
      data.$bind('filters.type', 'input[name="type"]');

      /* Watch for changes and refetch news */
      data.$watch('filters', async () => {
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
  {/* Initial server-rendered content, replaced on filter changes */}
</div>
```

Reactive data is minimal, atomic, and DOM-aware by default, no extra setup needed.

---

### 🌐 Global Store
Atomic exposes a shared global store for cross-component coordination:
```tsx
<Script data={{locale:'nl'}}>{({$}) => {
  $.storeSet('locale', data.locale);
  console.log($.storeGet('locale')); // -> 'nl'
}}</Script>
```

But more importantly:
- The store **hydrates automatically** from `localStorage` on load (using the `$tfs:` prefix)
- `$.storeSet(key, value)` **broadcasts** a `$store:key` relay event
- Use `el.$subscribe('$store:locale', handler)` to listen reactively anywhere
- Pass `{ persist: true }` to `storeSet` to persist the value to `localStorage`
- `$.storeDel(key)` removes a key from memory **and** localStorage, **and** triggers a relay event
- The store is **fully typed** via your `createScript<..., ..., Store>()` signature
```tsx
<Script>{({el, $}) => {
  /* Listen to locale update */
  el.$subscribe('$store:locale', (locale) => {
    ...
  });
}}</Script>
```

Ideal for global state like themes, locales, onboarding flags, and other app-wide coordination.

---

### 🧩 Atomic Modules

When using `createModule(...)` and passing your modules into `createScript({modules})`, all `<Script>` blocks gain typed access to those modules via `$.<name>`.

For example:
```tsx
<Script>
  {({ el, $ }) => {
    $.modal.open({ frag: '/about' });
    $.audio.play('intro');
  }}
</Script>
```

Modules are:
- Declared server-side
- Registered at the script level (not global)
- Auto-delivered just-in-time — no bundlers, no dead code

> ✅ They only ship when referenced in a `<Script>`, keeping your payloads atomic and minimal.

##### How to Define a Module
Below is an example `Modal` module (as seen in [Atomic Arcade](https://arcade.trifrost.dev) with full source [here](https://github.com/trifrost-js/example-atomic-arcade/blob/main/src/components/modules/Modal.tsx)):
```typescript
// Modal.ts
import {Module} from '~/script';

export function Modal () {
  return Module({
    name: 'modal',
    mod: ({ $ }) => {
      let root: HTMLDivElement | null = null;

      function open(frag: DocumentFragment) {
        root = $.create('div', { children: [frag] });
        document.body.appendChild(root);
      }

      return {
        open: async ({frag}:{frag:string}) => {
          if (root) root.remove();
          const res = await $.fetch<DocumentFragment>(frag);
          if (res.ok && res.content) open(res.content);
        },
        close: () => { root?.remove(); root = null; },
      };
    },
  });
}
```

Then register it:
```typescript
// script.ts
import { createScript, createModule } from '@trifrost/core';
import { type Env } from './types';
import { css } from './css';
import { Modal } from './components/modules/Modal';

export const { Module } = createModule({css});

const config = {
  atomic: true,
  css,
  modules: {
    modal: Modal,
  },
} as const;

export const { Script, script } = createScript<typeof config, Env>(config);
```

Now inside any `<Script>`, you can reference `$.modal`, `$.audio`, etc., with full typing, no imports needed.

For a full example (include an `AudioPlayer` module) see [Atomic Arcade](https://github.com/trifrost-js/example-atomic-arcade), or play it [live](https://arcade.trifrost.dev).

---

### 🔧 Atomic $ Utilities
Atomic gives you access to the Atomic `$` utilities. A suite of safe, zero-dependency, DOM-native helpers.
```tsx
<Script>{({el, $}) => {
  $.on(el, 'click', () => console.log('clicked'));
  $.storeSet('theme', 'dark');
}}</Script>
```

##### Event utilities
- `$.fire(el, type, {data?, mode?})`: Fires a `CustomEvent` from the provided element. Defaults to bubbling upward.
- `$.on(el, type, handler)`: Adds an event listener and automatically cleans up on unmount/element remove.
- `$.once(el, type, handler)`: Adds a one-time event listener that **auto-cleans on first call**.

##### DOM utilities
- `$.blurActive()`: Removes focus from the currently active element
- `$.clear(el)`: Clears a dom node
- `$.create(tag, opts)`: Creates a new DOM element (uses `createElementNS` for known SVG tags, and infers the return type by tag)
- `$.cssVar(name)`: Retrieve the value of a css static variable registered with css.var (see [Style System](/docs/jsx-style-system))
- `$.cssTheme(name)`: Retrieve the value of a css theme variable registered with css.theme (see [Style System](/docs/jsx-style-system))
- `$.query(el, selector)`: Scoped querySelector. (with type inference for common selectors)
- `$.queryAll(el, selector)`: Scoped querySelectorAll with **array** result. (with type inference for common selectors)
- `$.timedAttr(el, attr, opts)`: Sets an attribute on `el` and removes it after `opts.duration` (optional `after` callback)
- `$.timedClass(el, className, opts)`: Adds a class to `el` and removes it after `opts.duration` (optional `after` callback)

##### Global Store access
- `$.storeGet(key)`: Get a value from the global kv store.
- `$.storeSet(key, value, opts?:{persist:boolean})`: Set a value in the global kv store and optionally persists to local storage.
- `$.storeDel(key)`: Deletes a value from global kv store and local storage.

##### Miscellaneous
- `$.debounce(fn, delay)`: Debounced function wrapper.
- `$.eq(a, b)`: Structural equality check.
- `$.fetch(...)`: Smart wrapper around fetch with automatic body serialization and content parsing.
- `$.goto(...)`: Navigation helper to navigate to a specific url
- `$.isArr`: Verify a provided value is an array (**type guarded**)
- `$.isBool`: Verify a provided value is a boolean (**type guarded**)
- `$.isDate`: Verify a provided value is a **valid** Date instance (**type guarded**)
- `$.isFn`: Verify a provided value is a function (**type guarded**)
- `$.isInt`: Verify a provided value is an integer (**type guarded**)
- `$.isNum`: Verify a provided value is a finite number (**type guarded**)
- `$.isObj`: Verify a provided value is a plain object (**type guarded**)
- `$.isStr`: Verify a provided value is a string (**type guarded**)
- `$.isTouch`: Boolean getter which returns `true` if the device has touch capabilities and `false` if it doesnt
- `$.sleep(ms)`: Resolves after the specified delay.
- `$.uid()`: Generates a random id.

##### Notes on $.goto
`$.goto` is a high-level navigation helper for declarative and ergonomic client-side routing with built-in handling for query merging, blank tab opening, and replace-mode navigation.

Examples:
```typescript
$.goto("/dashboard");
// → Navigates to: /dashboard
```
```typescript
$.goto("/login", "replace");
// → Replaces current history entry with /login
```
```typescript
$.goto("https://external.site", "blank");
// → Opens https://external.site in a new tab
```
```typescript
// Current url: https://app.local/settings?page=2&theme=dark

$.goto("/account", "query");
// → Navigates to: /account?page=2&theme=dark

$.goto("/search?q=test", "query");
// → Navigates to: /search?q=test&page=2&theme=dark

$.goto("/search?q=test&page=3", "query");
// → Navigates to: /search?q=test&page=3&theme=dark

$.goto("/profile", {
  replace: true,
  includeQuery: true
});
// → Replaces history with: /profile?page=2&theme=dark
```

##### Notes on $.fetch
- Automatically parses JSON, HTML, text, blobs, etc. based on the response `Content-Type`.
- Supports **timeout**: auto-aborts request after X milliseconds (internally uses AbortController)
- Supports **credentials**: Sent as `include` by default to support cookies/session auth.
- Returns
```typescript
{
  content: T | null;
  status: number;
  ok: boolean; /* True for http 2xx */
  headers: Headers;
  raw: Response | null;
}
```
- Graceful fallback: On unexpected content types or parse failures, `content` falls back to `null`.
- Safe defaults: Automatically serializes JSON payloads and sets headers unless `FormData` is used
- Auto-converts HTML response to a DocumentFragment for insertion ease
- Auto-converts Binary response to a Blob

---

### Examples
##### Event Handling + Store Access
```tsx
<Script data={{user: {name: 'Anna'}}}>
  {(el, data, $) => {
    const btn = $.query(el, 'button')!;
    const msg = $.query(el, 'p')!;

    $.on(btn, 'click', () => {
      const token = $.storeGet('auth.token');
      msg.textContent = token ? 'Authenticated ✅' : 'No Token ❌';

      $.fire(el, 'user:click', {data: {name: data.user.name}});
    });

    $.once(el, 'user:click', e => {
      console.log('Clicked once:', e.detail);
    });
  }}
</Script>
```

##### Debounced watch + Sleep
```tsx
<Script data={{search: ''}}>
  {(el, data, $) => {
    const resultBox = $.query(el, '.results')!;

    data.$bind('search', 'input[name="search"]');

    data.$watch('search', $.debounce(async (term) => {
      if (!term || term.length < 3) {
        resultBox.textContent = 'Enter at least 3 characters...';
        return;
      }

      resultBox.textContent = 'Searching...';
      await $.sleep(500); // simulate async

      // Fake result
      resultBox.textContent = term.toUpperCase();
    }, 300));
  }}
</Script>
```

##### Fetch and Inject
```tsx
<div>
  <button>Load Content</button>
  <section></section>
  <Script>{(el, data, $) => {
    const btn = $.query(el, 'button')!;
    const section = $.query(el, 'section')!;

    $.on(btn, 'click', async () => {
      const {status, content} = await $.fetch<DocumentFragment>('/snippet.html');
      if (status === 200 && content) {
        section.replaceChildren(content);
      }
    });
  }}</Script>
</div>
```

##### POST JSON Payload
```tsx
<Script>{async (el, data, $) => {
  const {status, content} = await $.fetch<{userId: string}>('/api/create-user', {
    method: 'POST',
    body: {name: 'Alice', age: 30}
  });

  if (status === 201) {
    console.log('Created user:', content);
  }
}}</Script>
```

##### Blob Fetch (eg: download)
```tsx
<Script>
  {async (el, data, $) => {
    const {status, content} = await $.fetch<Blob>('/download/file.zip');
    if (status === 200 && content) {
      const url = URL.createObjectURL(content);
      window.open(url, '_blank');
    }
  }}
</Script>
```

##### Timeout Fetch
```tsx
const res = await $.fetch('/api/heavy', { timeout: 3000 });
if (!res.ok) console.error('Request timed out or failed');
```

---

### Best Practices
- ✅ Define your `Script` and `Module` factories once (via `createScript()` and `createModule()`), and share them across your app
- ✅ Use `atomic: true` if you need reactivity, scoped lifecycle, pub/sub, or interactivity
- ✅ Pass modules into `createScript({modules})` to enable `$.<name>` just-in-time delivery
- ✅ Keep global logic in Modules (`Module(...)`), and local logic colocated in `<Script>`
- ✅ Prefer `data.$watch(...)` and `data.$bind(...)` over manual DOM tracking
- ✅ Use the `$` utils for everything from event listeners to element creation (`$.on`, `$.create`, `$.fire`, etc.)
- ✅ Define your event and store contracts using `AtomicRelay` and `AtomicStore` interfaces for full global typing
- ✅ Keep behavior colocated with markup, every `<Script>` is a reactive, isolated, fragment-safe unit
- ✅ Design modules like services: reusable, lazy, stateless, and DOM-aware
- ✅ Clean up logic with `el.$unmount`
- ❌ Don’t manually import your modules client-side, use the `$.<module>` interface
- ❌ Don’t mutate DOM outside the Atomic runtime, use `$` helpers to stay reactive

---

### TLDR
- `createScript({atomic: true})` enables fine-grained reactivity with lifecycle, pub/sub, data proxying, and more
- `<Script>` blocks become **per-node reactive VMs**, isolated, hydrated, CSP-safe
- Define global service-based logic using `Module(...)` and pass them to `createScript({modules})`
- Access registered modules inside `<Script>` via `$.<module>`, zero import, fully typed
- Modules are delivered **just-in-time**, only when referenced
- Global pub/sub via `el.$publish`, `el.$subscribe`, typed with `AtomicRelay`
- Global reactive store via `$.storeSet`, `$.storeGet`, typed with `AtomicStore`
- `$.fetch`, `$.fire`, `$.on`, `$.debounce`, a full DOM-native toolkit included
- No bundling, no hydration wrappers, everything SSR-first and fragment-ready

🚀 It's the power of a reactive runtime, delivered one fragment at a time.

---

### Atomic Arcade 🎮
Want to see TriFrost Atomic in action? Check out [Atomic Arcade](https://arcade.trifrost.dev), a fully interactive, zero-bundle gaming experience running entirely on Cloudflare Workers.

Built with **TriFrost Atomic**, the arcade showcases three classic games:
- **Tetris**: With keyboard controls, dynamic theming, fragment-based rendering and canvas control.
- **Breakout**: Featuring DOM-driven canvas control and some nice bouncy effects.
- **Snake**: With fast-paced reactivity and SSR-based food fragments.

Everything is powered by Atomic `<Script>` components and global Module-based services. Ambiently typed via `AtomicRelay` and `AtomicStore`, no client bundles, no hydration ceremony.

> 💾 View the source: [github.com/trifrost-js/example-atomic-arcade](https://github.com/trifrost-js/example-atomic-arcade)

Atomic Arcade is a perfect reference for building **modular, interactive islands** using TriFrost’s reactivity, lifecycle hooks, and global typing model, all in a worker-optimized footprint.

---

### Next Steps
Ready to learn more?
- Need a refresher on [JSX Basics](/docs/jsx-basics)?
- Take a technical dive into [JSX Fragments](/docs/jsx-fragments)?
- Script your first interactive component with [createScript](/docs/jsx-script-behavior)
- Or explore [styling with createCss](/docs/jsx-style-system)

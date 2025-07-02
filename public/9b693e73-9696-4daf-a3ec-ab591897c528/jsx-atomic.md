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

It's like a mini reactive runtime baked directly into your DOM tree.

---

### Runtime Footprint
When enabled:
- Adds **~8KB** static runtime (served once, cached forever)
- Injects **~300-500B** glue logic on a page with scripts

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
- `el.$unsubscribe(topic)`: Method allowing you to unsubscribe from a specific topic on the pubsub relay
- `el.$publish(topic, data)`: Method allowing you to publish data to a specific topic on the pubsub relay
- Automatic integration with mutation observers and relay system

##### Scoped Pub/Sub Relay
Every atomic script runs inside an isolated VM that can **communicate across nodes** using scoped [pub/sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern).
```tsx
<Script>{({el}) => {
  el.$subscribe('filters:open', (val) => console.log('opened?', val));
  el.$publish('filters:open', true);
}}</Script>
```

These relay messages are:
- Fully isolated per page render
- Strongly typed via your `createScript<..., RelayEvents>()` config
- Automatically cleaned up on unmount

**Relay Typing**:
You define available messages in `createScript`:
```typescript
type RelayEvents = {
  'filters:open': boolean;
  'user:auth': {id: string};
};

const {Script, script} = createScript<Env, RelayEvents>({atomic: true});
export {Script, script};
```

Handlers will be properly typed:
```typescript
el.$subscribe('filters:open', (val) => {
  val.toFixed(); // ❌ Error (val is boolean)
});
```

**Cross-Component Pub/Sub Example:**
```tsx
{/* Component A */}
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

Combined with the global store (below), this gives you safe reactive messaging across the page.

##### Typed Global Store
TriFrost Atomic includes a global reactive store:
- Write with `$.storeSet('key', value)`
- Read with `$.storeGet('key')`
- Listen with `el.$subscribe('$store:key', handler)`

Define store shape during setup:
```typescript
type StoreData = {
  locale: string;
  theme: 'light' | 'dark';
};

const {Script, script} = createScript<Env, RelayEvents, StoreData>();
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
<Script>
  {({$}) => {
    $.storeSet('theme', 'dark'); // triggers A's listener
  }}
</Script>
```

This demonstrates:
- How store changes act like global pub/sub
- That VMs can subscribe to store changes as if they were events
- No manual wiring, just declare `createScript<..., ..., Store>()` and you're good

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
- `$set(path, val)` or deep-merge objects with `$set(val)`
- `$watch(path, fn)` to subscribe to changes
- `$bind(path, selector)` to two-way bind to inputs, or `$bind(path, selector, watcher)` to combine a bind and watch in a single line

All deeply typed, scoped to the node, and automatically cleaned up.

Example form binding:
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

---

### 🌐 Global Store
Atomic gives access to a shared global store.
```tsx
<Script data={{locale:'nl'}}>{({$}) => {
  $.storeSet('locale', data.locale);
  console.log($.storeGet('locale'));
}}</Script>
```

But more importantly:
- `storeSet(...)` **broadcasts automatically** via `"$store:key"` relay
- You can listen to changes via `el.$subscribe('$store:open', handler)`
- It’s fully typed via your `createScript<..., ..., Store>()` setup

This makes it perfect for global state coordination.

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
- `$.on(el, type, handler)`: Adds an event listener and returns a disposer.
- `$.once(el, type, handler)`: Adds a one-time event listener that **auto-cleans on first call**.

##### DOM utilities
- `$.clear(el)`: Clears a dom node
- `$.query(el, selector)`: Scoped querySelector.
- `$.queryAll(el, selector)`: Scoped querySelectorAll with **array** result.

##### Global Store access
- `$.storeGet(key)`: Get a value from the global store.
- `$.storeSet(key, value)`: Set a value in the global store.

##### Miscellaneous
- `$.uid()`: Generates a random id.
- `$.sleep(ms)`: Resolves after the specified delay.
- `$.eq(a, b)`: Structural equality check.
- `$.debounce(fn, delay)`: Debounced function wrapper.
- `$.fetch(...)`: Smart wrapper around fetch with automatic body serialization and content parsing.

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
- Use `atomic: true` only when you need reactivity or global coordination
- Always define `createScript(...)` once and reuse
- Bind inputs with `$bind`, not manual `addEventListener`
- Watch deeply nested keys via `data.$watch('a.b.c')` or the entire leaf via `data.$watch('a')`
- Clean up logic with `el.$unmount`

---

### TLDR
- `atomic: true` gives you per-node VMs with reactive state, lifecycle, and messaging
- Runs at sub-framework cost, with DOM-native behavior
- Ideal for interactive fragments, modals, filters, toggles

---

### Next Steps
Ready to learn more?
- Need a refresher on [JSX Basics](/docs/jsx-basics)?
- Take a technical dive into [JSX Fragments](/docs/jsx-fragments)?
- Script your first interactive component with [createScript](/docs/jsx-script-behavior)
- Or explore [styling with createCss](/docs/jsx-style-system)

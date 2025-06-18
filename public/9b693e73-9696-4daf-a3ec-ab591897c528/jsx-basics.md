TriFrost includes a fast, runtime-aware JSX rendering engine designed specifically for SSR use cases.

Unlike traditional React-based setups, TriFrost JSX compiles directly to HTML strings, with built-in support for **contextual rendering**, **scoped styles**, **secure script hydration**, and **per-request nonce injection**.

This document covers the **basics** of using JSX with TriFrost, from setup to rendering, and introduces the primitives available to all JSX files.

👉 For more advanced usage, see:
- [JSX Script Behavior](/docs/jsx-script-behavior)
- [JSX Style System](/docs/jsx-style-system)
- [JSX Utilities](/docs/jsx-utils)

---

### Configuration
To use JSX in TriFrost, your `tsconfig.json` must be set up to use `@trifrost/core` as the JSX factory:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@trifrost/core",
    ...
  }
}
```

Make sure the **jsxImportSource** is set to `@trifrost/core`, which exports the appropriate JSX primitives (`jsx`, `jsxs`, `Fragment`) to compile JSX syntax into the TriFrost runtime-compatible shape.

---

### 🧠 How it works
TriFrost uses a custom JSX runtime that translates JSX into a lightweight virtual element tree. This tree is processed by the `ctx.html(...)` method, which ultimately produces an HTML string for the response.

Example usage:
```tsx
export const handler = async ctx => {
  return ctx.html(
    <html>
      <head>
        <title>My App</title>
      </head>
      <body>
        <h1>Hello, world!</h1>
      </body>
    </html>
  );
};
```

Behind the scenes, `ctx.html()`:
- Activates a rendering context (styles, script registry, etc.)
- Converts JSX into an HTML string via `render(...)`
- Injects collected styles and scripts
- Applies nonce where needed
- Resets the rendering context

---

### 🧬 Context Awareness
TriFrost's JSX engine can access the active request context via utilities:
- `env(key)`: Access environment variables from the currently rendering context's `ctx.env`
- `state(key)`: Access route state (eg: path parameters, state set by middleware, ...) from the currently rendering context's `ctx.state`
- `nonce()`: Access the CSP nonce for script/style tags

Example:
```tsx
import {env} from '@trifrost/core';

export function Meta() {
  return <meta name="env" content={env('NODE_ENV')} />;
}
```

These helpers ensure JSX output is aware of the current request lifecycle **without having to pass ctx around everywhere**.

👉 Learn more about:
- [Context](/docs/context-api)
- [Context State Management](/docs/context-state-management)
- [CSP Nonce](/docs/middleware-api-security)

---

### 🖼 Components
Any function that returns JSX can be used as a component:
```tsx
function Button() {
  return <button>Click Me</button>;
}

function Page() {
  return <main><Button /></main>;
}
```

The compiler calls each function component during rendering, injecting any `props` you've passed.

---

### 🧩 Primitives
TriFrost includes two first-class JSX components:

##### <Script>
This lets you write inline scripts in JSX:
```tsx
<Script>{el => {
  el.innerText = 'JS loaded';
}}</Script>
```

Scripts are de-duplicated, scoped, and automatically get the correct nonce.

If you pass a `src`, it will render a remote script:
```tsx
<Script src="https://example.com/foo.js" />
```

👉 Learn more in [JSX Script Behavior](/docs/jsx-script-behavior)

##### <Style>
Used to inject collected styles from the `createCss()` system:

```tsx
<Style />
```

It’s typically used once in `<head>` and auto-replaced with all **used** CSS.

> 💡 **Tip:** Note that when doing component-based renders (SSC) in combination with full-page renders (SSR) you might want to include `<Style />` in those components as well, this ensures the styles native to that component get served as well if that component is rendered standalone. Only the first `<Style />` instance gets injected (the one in `head` for example), all the rest get ignored safely unless they are the **first one** for that render.

👉 Learn how to craft responsive masterpieces and more in [JSX Style System](/docs/jsx-style-system)

---

### 💅 Styling with createCss
TriFrost ships with an atomic, scoped, and SSR-safe CSS Engine:
```tsx
const css = createCss();

const box = css({
  padding: '1rem',
  color: 'black',
  ':hover': { color: 'blue' },
});

<div className={box}>Hover me</div>
```

Out of the box this gives you:
- Nesting (like in sass)
- Ergonomic access to pseudo selectors like `:hover`, `:focus`, etc.
- Built-in media queries, exposed via `css.media`, for usage **at a component level**, etc.
- Built-in theming and variable tokens via `css.var` and `css.theme`
- Built-in reuse tokens via `definitions`

👉 Learn how to craft responsive masterpieces and more in [JSX Style System](/docs/jsx-style-system)

---

### 📤 Rendering Pipeline Summary
When calling `ctx.html(...)` with JSX:
- The internal `rootRender(...)` activates rendering engines (script, style, ...) and sets the current ctx as the active context
- JSX is walked and rendered to HTML
- Styles (`<Style>`) and Scripts (`<Script>`) get collected, deduped, and injected. Important to note that **only the used bits get injected**
- CSP nonces are applied if present
- Final HTML string is returned

---

### TLDR
- Configure TypeScript with `jsx: react-jsx` and `jsxImportSource: @trifrost/core`
- Use `ctx.html(...)` to render JSX trees
- Use `env()`, `state()`, and `nonce()` for request-aware rendering
- `<Script>` and `<Style>` auto-handle nonce, deduping, and hydration
- `createCss()` enables scoped, atomic styles without a client-side runtime

---

### Next Steps
For deeper JSX capabilities and understanding, explore:
- [JSX Script Behavior](/docs/jsx-script-behavior)
- [JSX Style System](/docs/jsx-style-system)
- [JSX Utilities](/docs/jsx-utils)

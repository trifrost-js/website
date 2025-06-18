TriFrost includes a powerful CSS-in-JS utility built on top of server-rendered JSX. It enables **atomic class generation**, **design token management**, **dark/light theming**, **media queries**, and **scoped utility definitions**, all from a type-safe, ergonomic API.

---

### 📦 Setup with createCss
You define your styling system using `createCss()`. This function returns a typed `css` instance that supports:
- Design tokens (`css.var`, `css.theme`)
- Definitions (`css.use(...)`, `css.mix(...)`)
- Media queries (`css.media`)
- Composable style objects (`css.mix(...)`)
- Unique class IDs (`css.cid()`)
- Built-in CSS Reset (`reset: true`)
- SSR-safe root style injection (`css.root()`)

---

### ☝️ Only define once
Call `createCss()` **once** in your app. We recommend isolating it in a single file (our preference is `css.ts`):
```ts
// src/css.ts
import {createCss} from '@trifrost/core';

export const css = createCss({
  var: {
    font_header: "'Fira Code', monospace",
    space_m: '1.5rem',
    rad_m: '1rem',
  },
  theme: {
    panel_bg: {
      light: '#FFFFFF',
      dark: '#0F0F0F',
    },
  },
  reset: true,
  definitions: mod => ({
    panel: {
      background: mod.$t.panel_bg,
      padding: mod.$v.space_m,
      borderRadius: mod.$v.rad_m,
    },
  }),
});
```

Then reuse across components:
```tsx
import {css} from '~/css';

export function Panel({children}) {
  return <div className={css.use('panel')}>{children}</div>;
}
```

---

### 🧩 css.use vs css.mix
`css.use()` and `css.mix()` work together for maximum flexibility.
- `css.mix(...)` deep merges any number of definitions or raw objects into a final style object.
- `css.use(...)` does the same **but returns a class name** and **registers it with the style engine**.

They both support conditional logic and nesting — here’s a real example:
```tsx
const cls = css.use(
  'br_m',
  {
    maxWidth: '100%',
    backgroundColor: css.$t.panel_bg,
    color: css.$t.panel_fg,
    textAlign: 'left',
    border: '1px solid ' + css.$t.panel_border,
    [css.media.desktop]: css.mix('sp_l', {
		[css.hover]: {
			borderColor: css.$t.panel_border_active,
		},
	}),
    [css.media.tablet]: css.mix('sp_m'),
  },
  style || {},
);

```

---

### 🌀 Compose Styles with css.mix(...)
If you want to build reusable fragments of style without generating a class yet, `css.mix()` gives you raw style objects:

```tsx
const base = css.mix('panel', {
  [css.hover]: {boxShadow: '0 0 10px red'},
});

<div className={css(base)} />;
```

Use `css.mix()` inside other mix/use calls or conditionally apply portions of styling logic.

---

### 🌗 Themes and Tokens
Design tokens come in two flavors:
- `css.var`: Static tokens (also available at the `css.$v` alias)
- `css.theme`: Light/Dark-aware tokens (also available at the `css.$t` alias)

All are converted to `var(--...)` and injected at the root:
```ts
fontSize: css.$v.font_s_body,
color: css.$t.panel_fg,
```

TriFrost supports both `:root` and `data-theme="dark"`-style overrides via `themeAttribute: true`.

---

### 🧠 Root Injection with css.root()
Calling `css.root()` **injects your reset, tokens, and themes** into the rendered HTML.

✅ When rendering full-page documents (e.g. via `ctx.html()`), **you should call** `css.root()` at the top of your tree.

🚫 When rendering **components or partials, you should NOT call** `css.root()`, just include a `<Style />` component at the end.

##### Full Page vs Component Render Example
Let's say you have a `ListComponent` that renders some styled UI. One route serves a **full page** with it, and another returns it in isolation (e.g. filtered data via a partial request).
```tsx
// components/ListComponent.tsx
import {css} from '~/css';
import {Style} from '@trifrost/core';

export function ListComponent({items}: {items: string[]}) {
  return (
    <>
      <ul className={css.use('list')}>
        {items.map(item => (
          <li key={item} className={css.use('list_item')}>
            {item}
          </li>
        ))}
      </ul>
      <Style /> {/* Only needed for component/fragment usage */}
    </>
  );
}
```

```tsx
// routes/list.ts
import {Router} from '@trifrost/core';
import {css} from '~/css';
import {ListComponent} from '~/components/ListComponent';

...
  // ✅ Full page render
  .get('/', ctx => {
    css.root(); // Injects tokens, themes, reset

    return ctx.html(
      <html>
        <body>
          <h1 className={css.use('text_header')}>All Items</h1>
          <ListComponent items={['A', 'B', 'C']} />
        </body>
      </html>
    );
  })
  // ✅ Partial component render (e.g. filtered via search input)
  .get('/filtered', ctx => {
    const items = ['B']; // Imagine this comes from ctx.query
    return ctx.html(<ListComponent items={items} />);
  });
```

**Why it matters**
- The `/` route is responsible for the full page and **must call** `css.root()` to ensure tokens/reset/theme are injected.
- The `/filtered` route just returns a fragment of HTML, so it **shouldn't call css.root()**, it simply includes `<Style />` at the component level so the engine knows where to add the styles.

> You only need `css.root()` when your render context controls `<html>` and `<body>` (aka a full page render).
> For anything else, skip it and rely on the outer layout (which is already clientside) to inject the tokens.

---

### 📱 Media Queries
The `css.media` object includes built-in breakpoints like:
```typescript
const cls = css.use({
  [css.media.mobile]: {
  	fontSize: '1.4rem',
  },
  [css.media.tablet]: {
    fontSize: '1.6rem',
  },
  [css.media.desktop]: {
    fontSize: '1.8rem',
  },
});
```

These are also automatically available for usage in your `definitions` block and components.

```ts
text_header: {
  fontWeight: 600,
  fontSize: css.$v.font_s_header,
  [css.media.mobile]: {
    fontSize: `calc(${css.$v.font_s_header} - .3rem)`,
  },
}
```

---

### 🎯 Unique Classnames with css.cid()
Need to generate a consistent, scoped ID for targeting?
```typescript
const modalId = css.cid(); // "tf-abc123"
return <div id={modalId} />;
```

---

### 🎞 Animations with css.keyframes(...)
Create scoped animations:
```typescript
const pulse = css.keyframes({
  '0%': {opacity: 0},
  '100%': {opacity: 1},
});
```

Then apply:
```tsx
<div style={{animation: `${pulse} 1s infinite`}} />
```

Or inline:
```tsx
<div
  style={{
    animation: `${css.keyframes({
      '0%': {opacity: 0},
      '100%': {opacity: 1},
    })} 1s ease`,
  }}
/>
```

---

### Best Practices
- ✅ Define a single `css.ts` instance and import it app-wide
- ✅ Use `css.use(...)` and `css.mix(...)` together for composable utility design
- ✅ Leverage `css.theme` for automatic dark/light switching
- ✅ Use `css.cid()` or `css.keyframes()` for scoped behaviors and animation
- ✅ Use `<Style />` at the bottom of styled component endpoints if not rendering full page HTML
- 🚫 Don’t call createCss() multiple times
- 🚫 Don’t call `css.root()` when rendering partial components with styling (as the tokens and reset are already on the clientside)

---

### Next Steps
For further JSX learnings, explore:
- [JSX Basics](/docs/jsx-basics)
- [JSX Script Behavior](/docs/jsx-script-behavior)
- [JSX Utilities](/docs/jsx-utils)

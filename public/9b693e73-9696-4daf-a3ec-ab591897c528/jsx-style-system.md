TriFrost’s styling engine was purpose-built for server-first applications. It enables **atomic class generation**, **design token management**, **dark/light theming**, **media queries**, and **scoped utility definitions**, all from a type-safe, ergonomic API without hydration wrappers.

This guide introduces how to define, structure, and use `css` instances with JSX in TriFrost, covering both the configuration via `createCss()` and usage within components.

---

### 🧰 Defining Your CSS System
Create your styling engine using `createCss()` and place it in a shared file (e.g. our recommendation `css.ts`).
```typescript
// css.ts
import {createCss} from '@trifrost/core';

export const css = createCss({
  // Design tokens (static variables)
  var: {
    font_header: '1.25rem',
    space_l: '2rem',
  },

  // Theme-aware variables (light/dark)
  theme: {
    bg_panel: {
      light: '#fff',
      dark: '#121212',
    },
  },

  // Automatically applies CSS reset
  reset: true,

  // Reusable definitions (utility classnames)
  definitions: mod => ({
    panel: () => ({
      backgroundColor: mod.$t.bg_panel,
      padding: mod.$v.space_l,
    }),
    text_header: () => ({
      fontSize: mod.$v.font_header,
      fontWeight: 600,
      [mod.media.mobile]: {
        fontSize: '1rem',
      },
    }),
  }),
});
```

> ⚠️ You should only ever call `createCss()` once per environment, and reuse the resulting `css` instance throughout your app.

##### Type Safety
TriFrost's styling engine is fully typed, meaning you **can’t reference a token, theme, or definition that doesn’t exist** and you’ll get autocomplete and validation on all:
- `css.use(...)` and `css.mix(...)` definitions
- `css.$v` and `css.$t` tokens
- `css.media.*` breakpoints
- `css.defs` dynamic definitions (eg: `css.defs.alert('danger')`)

For example:
```typescript
css.use(css.defs.alert('danger'), { // ✅ aware of definitions, and their types
  fontSize: css.$v.font_header, // ✅ autocomplete + safety
  color: css.$t.bg_panel,       // ✅ aware of light/dark values
});
```

This gives you refactor-safe, IDE-friendly styles that scale with confidence, without runtime validation.

##### Available Options
- **var**: `Record<string, string>`\nStatic design tokens available as `css.var`/`css.$v`
- **theme**: `Record<string, string|{light,dark}>`\nTheme-aware tokens available as `css.theme`/`css.$t`
- **breakpoints**: `Record<string, string>`\nCustom media queries accessible via `css.media`. Overrides built-in set.
- **reset**: `boolean`\nIf `true`, injects a minimal CSS reset at root.
- **definitions**: `(mod) => Record<string, (...args:any[]) => CSSObject>`\nNamed utility-style functions for reuse via `css.use(...)`, `css.mix(...)` or `css.defs.*`
- **animations**: `Record<string, {keyframes, duration, ...}>`\nPrebuilt keyframe configs accessible via `css.animation(...)`

> 💡 All options are optional, you can start simple and progressively enhance.

---

### 🚀 Registering in the App
To enable automatic SSR-safe styling:
```typescript
import {App} from '@trifrost/core';
import {css} from './css';
import {script} from './script';

const app = new App({
  client: {css, script},
});
```

This ensures:
- Global styles are emitted at build time (`/__atomics__/client.css`)
- Per-request styles are injected automatically
- Tokens, themes, and resets are registered exactly once

You never need to call `css.root()` manually, TriFrost handles that automatically.

Unless of course you're setting up global root styles like below:
```typescript
css.root({
  strong: {fontWeight: 600},
  h1: {fontSize: ...},
});
```

> **Take Note:** This is highly opinionated, but the above css.root behavior can have drawbacks as most of you will know.
> Take a look at the [Atomic Design Methodology](https://atomicdesign.bradfrost.com/chapter-2/) to understand better what I mean with this. I am personally a big fan of Atomic Design and you'll see me applying this in many projects as it more easily works at scale.

---

### 🧭 Prefer a guided setup?
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

### 🎨 Using Styles
So we've done our setup ... finally we can play around with it.

Let's start creating our masterpiece.

Import your shared `css` instance anywhere JSX is used:
```tsx
import {css} from '../css';

export function Panel() {
  const box = css.use('panel'); /* We're using a definition here */
  return <div className={box}>Styled panel</div>;
}
```

You can also define styles inline:
```tsx
import {css} from '../css';

export function Panel() {
  const cls = css.use({
    color: 'white',
    backgroundColor: 'black',
    [css.hover]: {color: 'yellow'},
  });
  return <div className={box}>Styled panel</div>;
}
```

Or build raw style objects:
```tsx
const hover = css.mix({
  [css.hover]: {boxShadow: '0 0 8px red'},
});
```

##### 🧩 css.use vs css.mix
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

You can use `css.defs.[name]`() for direct access to definition outputs, ideal for inline use or dynamic composition.
```typescript
const cls = css.use(
	css.defs.text_header(), // Direct use of definition output
	{
		fontSize: css.$v.font_s_small,
	},
);
```

> 💡 `css.mix` simply returns the merged object and does not register it with the style engine. `css.use` merges internally, registers a deterministic class name with the engine and returns it.
> It's important to understand the difference as one allows for composition where the other is meant for getting the class to set on a dom node for SSR.

---

### 🧬 Tokens & Theming
Design tokens come in two flavors:
- `css.var`: Static tokens (also available at the `css.$v` alias)\nRegistered as part of the `var` section of your `createCss` config.
- `css.theme`: Light/Dark-aware tokens (also available at the `css.$t` alias)\nRegistered as part of the `theme` section of your `createCss` config.

All are converted to `var(--...)` and injected at the root.

Example Usage:
```typescript
css.use({
  fontSize: css.$v.font_header,
  color: css.$t.bg_panel,
});
```

Themes are automatically toggled based on the **preferred theme of the browser**.

> 💡 TriFrost also allows manual setting of light vs dark through the `data-theme` prop on the HTML node.

---

### 📱 Responsive Utilities
Media queries are preconfigured and available via `css.media`:
```typescript
const responsive = css.use({
  fontSize: '1rem',
  [css.media.tablet]: {fontSize: '1.2rem'},
});
```

You can use these inside both definitions and inline styles.

##### Default Breakpoints
The below shows the default set of breakpoints defined within the TriFrost styling system:
```typescript
css.media.mobile /* <= 600px */
css.media.tablet /* <= 1199px */
css.media.tabletOnly /* > 600px AND < 1200px */
css.media.tabletUp /* > 600px */
css.media.desktop /* >= 1200px */
```

##### Media queries in definitions
When defining utilities via `createCss({ definitions })`, you can reference `mod.media` to scope styles per breakpoint:
```typescript
definitions: mod => ({
  text_title: () => ({
    fontWeight: 700,
    fontSize: '1.8rem',
    [mod.media.mobile]: {
      fontSize: '1.4rem',
    },
    [mod.media.desktop]: {
      fontSize: '2rem',
    },
  }),
})
```

##### Defining custom breakpoints
Though we tend to have sensible defaults you can override the built-in `css.media` breakpoints by passing a `media` field to `createCss()`:
```typescript
export const css = createCss({
  breakpoints: {
    mobile: '@media (max-width: 640px)',
    tablet: '@media (min-width: 641px) and (max-width: 1024px)',
    desktop: '@media (min-width: 1025px)',
    wide: '@media (min-width: 1440px)',
  },
});
```

You can then use these like so:
```typescript
css.use({
  fontSize: '1rem',
  [css.media.wide]: {fontSize: '1.5rem'},
});
```

Or directly within definitions:
```typescript
export const css = createCss({
  breakpoints: {
    mobile: '@media (max-width: 600px)',
  },
  definitions: mod => ({
    base: () => ({
      padding: '1rem',
      [mod.media.mobile]: {
        padding: '.5rem',
        color: 'black',
      },
    }),
  }),
});
```

> **💡 Take Note**: When passing custom media breakpoints you are **overriding the existing set**.

---

### 🌀 Animations
TriFrost supports scoped keyframes, but they must be declared **at render time, not globally**.
```typescript
const pulse = css.keyframes({
  '0%': {opacity: 0},
  '100%': {opacity: 1},
});

const animCls = css.use({
  animation: `${pulse} 1s infinite`,
});
```

Here's two examples of keyframe usage:
- the [shooting star](https://github.com/trifrost-js/website/blob/main/src/components/atoms/GridBackground.tsx) effect from our website's homepage.
- the [benchmark](https://github.com/trifrost-js/website/blob/c0c38dbd6bf2911edac559bbf244b0420492d8c7/src/pages/root/components/Benchmark.tsx#L57) component with a progress bar animation.

You can also register prebuilt animations using `createCss({ animations: { ... } })`, and use them via `css.animation('name', overrides?)`.

For Example:
```typescript
// css.ts
const css = createCss({
  animations: {
    fadeInUp: {
      keyframes: {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
      },
      duration: '0.4s',
      easingFunction: 'ease-out',
    },
  },
  definitions: css => ({
    card: () => ({
      padding: '1rem',
      borderRadius: '0.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }),
  }),
});
```

```tsx
// Component.tsx
const cls = css.use('card', css.animation('fadeInUp', { delay: '100ms' }));

return <div className={cls}>Animated Card</div>;
```

---

### 🔧 Ergonomic Utilities
On top of the `css` instance being your one-stop shop for theme tokens, definitions, etc, it also gives you access to a world of ergonomic utilities making it easier to create/build more complex css.

Here's a rundown of those utilities:
```typescript
// Pseudo selectors
[css.hover]: { color: 'blue' },                      // On hover
[css.active]: { transform: 'scale(0.95)' },          // On active press
[css.focus]: { outline: '2px solid currentColor' },  // On focus
[css.focusVisible]: { boxShadow: '0 0 0 3px blue' }, // Keyboard focus only
[css.focusWithin]: { background: 'gray' },           // Parent of focused child
[css.disabled]: { opacity: 0.5 },                    // Disabled element
[css.checked]: { borderColor: 'green' },             // Checked input
[css.visited]: { color: 'purple' },                  // Visited link

// Structural pseudo-classes
[css.firstChild]: { marginTop: 0 },
[css.lastChild]: { marginBottom: 0 },
[css.firstOfType]: { borderTop: '1px solid' },
[css.lastOfType]: { borderBottom: '1px solid' },
[css.empty]: { display: 'none' },

// Element states
[css.before]: { content: '"• "', color: 'red' },
[css.after]: { content: '" →"', fontWeight: 'bold' },
[css.placeholder]: { color: 'gray' },
[css.selection]: { background: 'yellow' },

// Attribute selectors
[css.attr('aria-expanded')]: { background: 'blue' },
[css.attrStartsWith('data-role', 'btn')]: { fontWeight: 600 },
[css.attrEndsWith('type', 'button')]: { borderRadius: '6px' },
[css.attrContains('class', 'highlight')]: { color: 'yellow' },

// nth-style selectors
[css.nthChild('odd')]: { backgroundColor: '#f0f0f0' },
[css.nthLastChild('2')]: { fontStyle: 'italic' },
[css.nthOfType('3n')]: { fontSize: '1.2rem' },
[css.nthLastOfType('1')]: { textTransform: 'uppercase' },

// Logic combinators
[css.not(':last-child')]: { marginRight: '1rem' },
[css.is('button, a')]: { cursor: 'pointer' },
[css.where('.card', '.box')]: { padding: '2rem' },
[css.has('img')]: { border: '1px solid gray' }, // parent of element matching selector
[css.dir('rtl')]: { direction: 'rtl' }, // directionality
```

As well as `css.cid()` which returens a unique id for classnames or DOM targeting:
```tsx
const id = css.cid();
return <div id={id}>...</div>;
```

---

### Multiple CSS Instances
In rare cases, you might want multiple isolated `css` instances, for example lets say you're working with serverside email rendering.

For this use-case you can tap into `ctx.render`. This is the same method `ctx.html` uses behind the scenes, and it allows passing your own css instance to it (by default the app-wide css instance will be provided to it).
```tsx
const emailCss = createCss({ ... });

ctx.render(
  <MyFancyEmailTemplate>
    ...
  </MyFancyEmailTemplate>,
  {css: emailCss}
);
```

---

### Disabling Injection
Though a rarity (as TriFrost handles most of this) in certain edge cases you'll want to disable style injection alltogether.

You can disable injection through:
```typescript
css.disableInjection();
```

This prevents the style engine from collecting and emitting styles, but does NOT prevent deterministic class names from being generated.

---

### Best Practices
- ✅ Define and reuse a single `css` instance
- ✅ Pass it via `client: {css}` in your `App`
- ✅ Use `css.use(...)` to register styles
- ✅ Use `css.mix(...)` to compose without emitting classes
- ✅ Keep `css.keyframes()` in the component render scope
- ✅ Leverage tokens and definitions for consistency

---

### Next Steps
Ready to learn more?
- Learn about [JSX Atomic Runtime](/docs/jsx-atomic) for reactivity, stores, global pubsub and more
- Need a refresher on [JSX Basics](/docs/jsx-basics)?
- Take a technical dive into [JSX Fragments](/docs/jsx-fragments)?
- Or explore [Scripting with createScript](/docs/jsx-script-behavior)

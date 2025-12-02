TriFrost just got a little leaner, a little cleaner, and a lot more native.

Over the past few days, we’ve quietly removed **all** usage of HTMX from the TriFrost website. Not because it broke. Not because we had to.

But because we **don't need it anymore**.

---

### Enter <Script>
The new `<Script>` component (introduced in `0.33.0`) was originally meant for inlining client logic **securely, automatic nonce injection, CSP-safe, runtime-aware**.

But it turned out to allow **a tad more**.

We realized: instead of reaching for a DOM injector like HTMX, with its own triggers, magic, attributes, and external runtime — we could just ... **write the JS we wanted**.

And with `<Script>` it's safe, scoped and declarative.

---

### What Changed?
We used to write forms like this (actually how the news section on the TriFrost website worked):
```tsx
<form
  hx-post="/news"
  hx-target="#news-list"
  hx-swap="outerHTML"
  hx-trigger="change from:input"
>
  ...
</form>
```

Which worked! But it brought in/required:
- An external script
- Runtime config (eg: `htmx.config.inlineScriptNonce`)
- CSP headaches
- A fuzzy mental model

Now?
```tsx
<form>
  ...
  <Script>{el => {
    async function load () {
      const res = await fetch('/news', {method: 'POST', body: new FormData(el as HTMLFormElement)});
      if (res.ok) document.querySelector('#news-list')!.outerHTML = await res.text();
    }

    el.querySelectorAll('input').forEach(input => input.addEventListener('change', load));
  }}</Script>
</form>
```

No runtime. No external scripts. Just **clear behavior**, colocated where it belongs.

---

### Security Comes Built In
Because `<Script>` automatically applies a [CSP-compliant nonce](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src), there's **no need** to allow `'unsafe-inline'` or `'unsafe-eval'`.

Compare that to HTMX which, despite its minimal footprint, still required:
```tsx
<Script src="https://unpkg.com/htmx.org" />
<Script>{`
  htmx.config.inlineScriptNonce = "\${nonce()}";
  htmx.config.inlineStyleNonce = "\${nonce()}";
`}</Script>
```

... which **didn’t even work during SSR** 😅.

With `<Script>`, you get:
- Automatic nonce handling
- Inline + external script support
- No CSP violations
- No runtime dependency

---

### Easier to reason about
The mental model here is **just the DOM**.

Want to toggle dark mode? (this is actually how our theme switcher works)
```tsx
<button>
    Toggle
    <Script>{el => {
        el.addEventListener('click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('trifrost-theme', next);
            el.setAttribute('aria-label', next);
        });
    }}</Script>
</button>
```

No new syntax. No new abstractions. Just **your logic**, securely scoped to the parent node.

---

### Dogfooding, Always
This wasn’t theoretical. We adjusted the site. We dogfooded it.

Every button, form, tab group, and interaction now runs on `<Script>`.

HTMX was great while it lasted, but it introduced a new vocabulary. A new runtime. A new surface for CSP policies to break.

TriFrost already gives you everything you need.

---

As always, stay frosty. ❄️

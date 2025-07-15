This example showcases a fully reactive, fragment-rendered arcade experience built with **TriFrost Atomic**, running entirely on [Cloudflare Workers](https://developers.cloudflare.com/workers/).

No bundlers. No hydration wrappers. Just streaming HTML, scoped styles, and atomic logic — rendered and delivered **on demand**.

It’s more than just a tech demo — it started as a benchmark for fragment reactivity and evolved into a fully playable arcade with Snake, Tetris, and Breakout. Each game runs in isolation, fragments hydrate independently, and global coordination (modals, audio, theme) happens through scoped relays and shared modules.

> Read the full blog post: [Atomic Arcade: Fragments In Motion](/news/blog/atomic_arcade_fragments_in_motion)

## How It Works
The arcade runs entirely on server-rendered fragments, with **zero client bundles**. Every interaction, menus, games, themes, is coordinated through `<Script>` and `Module` components provided by TriFrost’s [Atomic Runtime](/docs/jsx-atomic).

All pages and components are rendered **just-in-time** using fragments. Style shards and behavior scripts are deduplicated on the fly, making performance and rehydration seamless, no matter how often the DOM updates.

> ⚡ Atomic Arcade is a **bundle-free, streaming-native gaming site**. It’s not just fast, it’s a blueprint for fully reactive islands, built server-first.

## Project Setup
This project was scaffolded with [npm create trifrost@latest](/docs/cli-quickstart), giving us an instant boilerplate with JSX, [Atomic](/docs/jsx-atomic), and styling support out of the box.

From there, we customized it with:
- Game logic encapsulated in fragment-aware routes
- Shared layout + atomic styling
- Two global modules for **modals** and **audio**
- [AtomicRelay](/docs/jsx-atomic) pubsub events
- [AtomicStore](/docs/jsx-atomic) for typed local storage of settings

##### Structure
```bash
atomic-arcade/
├─ src/
│  ├─ components/  # Fragmented game + ui components
│  ├─ routes/      # Game routes/logic (Tetris, Breakout, Snake)
│  ├─ css.ts       # Design tokens + definitions
│  ├─ script.ts    # Atomic Script + Module system
│  └─ index.ts     # Entrypoint
└─ public/         # Assets (audio, images, ...)
```

## Why This Matters
TriFrost Atomic was built to push the boundaries of **fragment-based reactivity**, and Atomic Arcade became the testbed for it.

> `"I needed something to break. That something became Atomic Arcade."`\n~ From the [Fragments In Motion](/news/blog/atomic_arcade_fragments_in_motion) blog post

Through this project, we tested:
- 💡 Cross-fragment event coordination via [AtomicRelay](/docs/jsx-atomic)
- 🧩 Dynamic script injection + deduplication
- 🎮 Canvas loops controlled from scoped `<Script>` instances
- 🔈 Module-based audio control
- 🧹 Scoped cleanup and reactivity lifecycles

Every menu, every pixel of food, every line cleared in Tetris, all of it runs inside an isolated atomic VM, rendered server-side and hydrated **only when needed**.

## Fragment-Based Rendering
Every interaction is powered by [fragment rendering](/docs/jsx-fragments), each `ctx.html(...)` returns only the JSX/scripts/styles you need for that interaction.
- **Menus** swap in and out as fragments
- **Games** are mounted on demand with DOM + Canvas logic inside `<Script>`
- **Modals** and global state are coordinated with AtomicRelay and AtomicStore

This architecture ensures fast load times, scoped hydration, and safe style/script injection across page changes.

> 🧩 Want to understand how this works? Read [JSX Fragments](/docs/jsx-fragments) and [Script Behavior](/docs/jsx-script-behavior)

## Request Flow & Runtime Wiring
When a request hits the arcade, TriFrost assembles everything **just-in-time**:
- Styles are auto-sharded based on component usage
- `<Script>` and **dependent Modules** are injected with **CSP-safe hydration**
- Atomic relay and store are wired up, no global leaks

Here’s what a full request-to-response pipeline looks like:
```bash
# 1️⃣ User lands on homepage (`/`)
$ GET /

📦 → /routes/index.tsx
  ├─ <Home /> JSX
  ├─ Uses: Modal module + home styles + home scripts

📤 Response includes:
  ├─ ✅ HTML: Home layout
  ├─ 🎨 Styles: Only from Home
  ├─ 🔒 Scripts: Home behaviors
  └─ 🧠 Modules: modal (as used in home scripts)

# 2️⃣ User clicks "Snake"
$ GET /snake → ctx.html(<Snake />)

📦 → /routes/snake/routes.tsx
  ├─ <Snake /> JSX
  ├─ Uses: Audio module + Snake styles + Snake logic

📤 Response includes:
  ├─ ✅ HTML: Snake grid, controls
  ├─ 🎨 Styles: Snake-specific
  ├─ 🔒 Scripts: Input + Game loop
  └─ 🧠 Modules: audio ← modal already mounted, skipped

# 3️⃣ Game begins: food spawns
$ GET /snake/food → ctx.html(<Food />)

📦 → /routes/snake/atoms/Food.tsx
  ├─ <Food /> JSX
  ├─ Uses: styles + scripts for interactive food

📤 Response includes:
  ├─ ✅ HTML: Food node
  ├─ 🎨 Styles: Food-specific
  └─ 🔒 Scripts: Food behavior (e.g. bounce, click)

# 4️⃣ Another food spawns (script already present)
$ GET /snake/food → ctx.html(<Food />)

📦 TriFrost deduplicates:
  ├─ ✅ HTML: New food
  ├─ 🎨 Styles: Only new shards (if any)
  └─ 🔒 Scripts: ✅ Already hydrated — not resent
```

Response:
- **HTML**: Rendered JSX for the response
- **Style shards**: auto-injected with deduplication
- **Scripts**: hydrated with CSP nonce, serialized in-place and auto-deduped
- **Dependend modules**: activated once per page, ready to handle pubsub or relay

> 💡 Since everything is reactive, no hard coupling exists between routes. Each one can mount/unmount fragments, inject scripts, or trigger global events.

This allows:
- **Snake** to spawn a `<Script>`-hydrated food fragment mid-game
- **Tetris** to control keyboard input and re-render lines dynamically
- **Modals** to open from any game or route via `$.modal.open(...)` (**fully typed**)
- **Audio** to auto-respond to `$.audio.fx(...)`

It’s a **runtime-powered graph**, with each node **living only as long as it’s needed**.

## Features
- 🕹️ **Zero-bundle arcade games**: rendered entirely via server fragments
- 🧠 **Reactive VM model**: every `<Script>` node runs inside an isolated lifecycle-aware sandbox
- 🧩 **Full JSX Fragment pipeline**: all updates are streamed, deduped, and nonced
- 🎨 **Atomic CSS**: scoped definitions and responsive theming
- 📦 **App logic and visuals co-located** in single JSX files
- 🔊 **Audio + modal management**: powered by global [Module components](/docs/jsx-atomic)
- 🌐 **Edge Native**: Runs entirely on **Cloudflare Workers** for instant responses

## Examples
Want to dive deeper?
- See how **Snake** uses fragment-based food spawning
- Watch **Tetris** mount a canvas and control input via `$.on(...)`
- Observe how the **modals** automatically extend the **Atomic** `$` utils with `$.modal.open(...)` and `$.modal.close(...)`

> ✅ All styles are auto-collected per fragment\n✅ All `<Script>` instances are isolated, **nonced**, and hydrated in-place\n✅ You won’t find a single bundler or client-side framework

## Runtime
This example runs entirely on **[Cloudflare Workers](https://developers.cloudflare.com/workers/)**, optimized for low-latency, global rendering with fragment support baked in.

TriFrost handles:
- ✅ CSP-safe style/script injection
- ✅ Streaming-compatible hydration
- ✅ Lifecycle-scoped modules + VMs

> 💡 Want to inspect or run the code yourself? It’s [open source](https://github.com/trifrost-js/example-atomic-arcade) and intentionally minimal.
> No indirection. No framework glue. Just DOM, scripts, and style.

> 🕹️ Want to learn the story behind it? [Read the full blog](https://www.trifrost.dev/news/blog/atomic_arcade_fragments_in_motion).

## Resources
- [TriFrost Atomic Runtime](/docs/jsx-atomic): Per-node reactivity, lifecycle, and pub/sub
- [JSX Fragments](/docs/jsx-fragments): Learn how server-rendered fragments work
- [JSX Basics](/docs/jsx-basics): Everything you need to know to build with TriFrost JSX
- [Script Behavior](/docs/jsx-script-behavior): Learn how `<Script>` and `Module` hydrate behavior
- [CLI Quickstart](/docs/cli-quickstart): Scaffold a new project with npm create trifrost@latest

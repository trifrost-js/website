Over the past few weeks, you might’ve noticed a steady stream of TriFrost releases. If you were wondering what prompted the pace, the answer is simple: **I needed something to break**.

That “something” became [Atomic Arcade](https://arcade.trifrost.dev).

What started as a simple test for fragment lifecycles turned into a full-featured mini arcade. Three games: Snake, Tetris, and Breakout,  all built from runtime fragments. No bundlers. No preloads. Just HTML, CSS, and JS assembled live by the TriFrost runtime.

### A Practical Benchmark
TriFrost Atomic is designed around a simple idea: rendering doesn’t have to be app-centric. It can be compositional, scoped, and delivered in pieces — fragments — that run independently and cleanly.

But it’s one thing to describe that. It’s another to build something that actually uses it.

The arcade gave me a way to test:
- cross-fragment event coordination
- canvas rendering via pub/sub
- scoped CSS and DOM cleanup
- dynamic script injection
- server-first routing across interactive modules

It wasn’t just about the games. It was about pushing the runtime hard enough to find its edges. And those edges showed up — in event timing, in cleanup order, in subtle race conditions between fragments.

Each one got patched. Many of those patches are in the changelog.

### Nostalgia as Constraint
The visual style wasn’t an afterthought. I grew up on a Game Boy. I remember the exact pacing of Tetris, the game over sound. That memory was useful — because it imposed constraints:
- Grid-based layouts
- Pixel art food (as SVG fragments)
- Sound coordination through pub/sub
- Snake as a render-to-canvas loop, no linked lists

The goal wasn’t visual accuracy. It was to build something that felt like those games, in how it behaved and how it sounded.

### Runtime First, Always
The most important part of the arcade isn’t what you see, it’s what you don’t:
- There’s no bundler involved
- No hydration boundary
- No client-side router

Each route resolves to a fragment — scoped and isolated — which boots up its own logic, coordinates its own canvas, and listens to a few shared events. It’s reactive, but not in the way we’ve come to expect. It’s reactive at the DOM level, not the VDOM level.

That’s what TriFrost Atomic enables: just-in-time HTML, streamed and run as fragments. The arcade is a testbed for that — and a signal that it’s viable.

### Looking Ahead
This isn’t the end goal for TriFrost. But it’s a solid milestone. A full interactive app, with audio, canvas, and cross-fragment behavior, all delivered without preloading or bundling.

If you’re curious how it works, read the [code](https://github.com/trifrost-js/example-atomic-arcade). It’s small. No indirection. Just DOM, scripts, and style.

Thanks for playing.

As always, stay frosty ❄️

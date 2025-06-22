This example showcases a multi-page server-rendered **TriFrost** application running on [Node.js](https://nodejs.org/), containerized with [Podman](https://podman.io).

It demonstrates runtime-agnostic rendering, [HTMX](https://htmx.org/)-driven interactivity (for comments), and optional observability with [SigNoz](https://signoz.io/).

## How It Works
The app uses TriFrost’s flexible routing and JSX rendering to deliver a home page, about page, and a blog page with dynamic comments.

HTMX handles comment posting and deletion via fragment swaps, making it lightweight and responsive without a heavy frontend framework.

You can run it standalone with Node.js or containerize it with Podman and Podman Compose — a perfect showcase of TriFrost’s runtime flexibility (just compare it with our [Cloudflare Example](/examples/trifrost_htmx_todos) and you'll note there's very little that needs to change).

This example is set up to optionally send OpenTelemetry traces to [SigNoz](https://signoz.io/), giving you visibility into route performance, request flows, and system health.

To enable it, provide your `SIGNOZ_API_TOKEN` in a `.env` file and uncomment the  `OtelHttpExporter` block in `index.ts` and you're good to go.

##### Project Structure
```bash
trifrost-mini-site/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ css.ts
│  ├─ index.ts
│  └─ types.ts
├─ Containerfile
├─ compose.yml
├─ package.json
├─ tsconfig.json
└─ .env
```

## Logic
The app is initialized in `index.ts` using TriFrost’s `App` class. Middleware like security and CORS are added, then routing groups (`homeRouter`, `aboutRouter`, `blogRouter`) are wired in.

Each page uses server-rendered JSX, the blog section includes dynamic comment handling through HTMX.

The client option with our css instance ensures TriFrost Atomic (0.36+) automounts our css root to `/__atomics__/client.css`, ensuring no repeat global styles but only page-specific styles get inlined.
```typescript
// src/index.ts
import {App, Security, Cors, OtelHttpExporter} from '@trifrost/core';
import {type Env} from './types';
import {homeRouter} from './pages/home';
import {aboutRouter} from './pages/about';
import {blogRouter} from './pages/blog';
import {notFoundHandler} from './pages/notfound';
import {css} from './css';

new App<Env>({client: {css}})
  .use(Security())
  .use(Cors())
  .group('/', homeRouter)
  .group('/about', aboutRouter)
  .group('/blog', blogRouter)
  .onNotFound(notFoundHandler)
  .boot({port: Number(process.env.PORT || 3000)});
```

## Page Breakdown
Each of these pages is set up as its own router group (`homeRouter`, `aboutRouter`, `blogRouter`) and connected in the main `index.ts`.

They use a shared layout wrapper for consistency, pulling in navigation, headers, and theme-aware styles.

- **Home Page** (`/`)\nProvides a welcoming introduction to TriFrost, explaining its mission as a runtime-agnostic, fast server framework. Uses a simple JSX layout with hero text and buttons.
- **About Page** (`/about`)\n Gives background on what makes TriFrost special,  its **composable middleware**, **multi-runtime compatibility** (Node, Bun, Workerd), and **built-in observability**. This page uses bullet lists and styled sections.
- **Blog Page** (`/blog`)\nThe most interactive section, listing blog posts and allowing users to submit and delete comments live via HTMX. This showcases TriFrost’s ability to handle fragment rendering and dynamic state updates without a heavy frontend framework.

## Styling
Styling is centralized in `css.ts` using TriFrost’s `createCss` system. It defines dark/light themes, font families, spacing scales, and responsive helpers, enabling consistent component styling and easy overrides.

Once a var/theme variable is defined they are respectively available at `css.$v.[variable name]` and `css.$t.[variable name]` anywhere in your app.

Important Notes:
- **definitions** are not included in the css if not used. They form your backbone to centralize reusable pieces of styling without bloating the page if not used, they get merged in with client styles by using `css.use` and `css.mix`.
- Since TriFrost 0.36 Atomic, **global styles** such as the **css reset** and **theme/global variables** get bundled in a file and mounted at `__atomics__/client.css` if you pass your `css` instance as part of the **client options on App**. The system takes care of adding the link automatically to your output HTML.

```typescript
// src/css.ts
export const css = createCss({
  reset: true,
  var: {
    font_header: "'Fira Code', monospace",
    font_body: "'Roboto', Sans-serif",
    radius: '0.5rem',
    space_s: '0.5rem',
    space_m: '1rem',
    space_l: '2rem',
    space_xl: '4rem',
  },
  theme: {
    bg: {
      light: '#f9fafb',
      dark: '#1f2937',
    },
    fg: {
      light: '#1f2937',
      dark: '#f9fafb',
    },
    nav_bg: {
      dark: '#020810',
      light: '#c7c7c7',
    },
    nav_fg: {
      dark: '#ffffff',
      light: '#000000',
    },
    ...
  },
  definitions: (mod) => ({
    f: {display: 'flex'},
    fh: {flexDirection: 'row'},
    fv: {flexDirection: 'column'},
    fa_c: {alignItems: 'center'},
    fj_c: {justifyContent: 'center'},
    sm_v_l: {marginBottom: mod.$v.space_l, marginTop: mod.$v.space_l},
    text_header: {
      fontFamily: mod.$v.font_header,
      fontWeight: 'bold',
      [mod.media.desktop]: {
        fontSize: '2.2rem',
      },
      [mod.media.tablet]: {
        fontSize: '2rem',
      },
    },
    text_title: {
      fontFamily: mod.$v.font_header,
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    ...
  }),
});
```

**PS:** If you want to check out the different light/dark modes, open up dev tools in Chrome (assumption, sorry ^^):
```typescript
// In the Chrome DevTools Console:
document.documentElement.setAttribute('data-theme', 'dark'); // Switch to dark mode
document.documentElement.setAttribute('data-theme', 'light'); // Switch to light mode
```

## Containerization
The `Containerfile` uses a multi-stage build: first compiling the TypeScript project, then packaging only production files.

This is also the file that builds your source into a container ready for deployment.

```dockerfile
# =============================================================================
# Development Stage
# =============================================================================

  FROM node:22-alpine AS development

  WORKDIR /app

  COPY package*.json ./
  RUN npm install

  # Copy source
  COPY . .

  # Start dev server
  CMD ["npm", "run", "dev"]

# =============================================================================
# Build Stage
# =============================================================================

  FROM development as builder
  RUN npm run build

# =============================================================================
# Production Stage
# =============================================================================

  FROM node:22-alpine AS production

  # Set NODE_ENV to production
  ENV NODE_ENV=production

  WORKDIR /app
  COPY package*.json ./
  COPY --from=builder /app/dist ./dist

  # Install dependencies and prune
  RUN npm install --omit=dev && npm prune

  # Change to 1000 user
  RUN chown 1000:1000 /app

  # Switch user
  USER 1000:1000

  # Start prod server
  CMD ["node", "./dist/index.js"]
```

`compose.yml` defines the service, port mappings, and volume mounts for **local** orchestration.
```yaml
version: '3'

services:
  website:
    build:
      context: .
      target: development
    tty: true
    environment:
      - PORT=3000
      - TRIFROST_NAME="TriFrost_Website"
      - TRIFROST_VERSION="1.0.0"
    ports:
      - "3000:3000"
    volumes:
      - './:/app:z'
      - 'node_modules:/app/node_modules:z'
volumes:
  node_modules:
```

## Environment
We define an `Env` type in `types.ts` to describe environment bindings like `PORT` and optional observability tokens like `SIGNOZ_API_TOKEN`. This lets the app pull runtime config from `process.env` without hardcoding values, making it deployment-flexible.

We also define our own app-specific `Context` and `Router` types here. These will automatically be aware of our Environment simply by passing it as a generic.

> **Note**: When working with **Podman**, you will need to also provide the Environment bindings in `compose.yml` for local development.

```typescript
// src/types.ts
import {type TriFrostRouter, type TriFrostContext} from '@trifrost/core';

export type Env = {
  PORT: string;
  SIGNOZ_API_TOKEN: string;
};

export type Context<State extends Record<string, unknown> = {}> = TriFrostContext<Env, State>;

export type Router<State extends Record<string, unknown> = {}> = TriFrostRouter<Env, State>;
```

## Resources
- [TriFrost](https://trifrost.dev): The runtime-agnostic server framework behind this example.
- [HTMX](https://htmx.org): Add AJAX, WebSockets, and more to HTML using attributes.
- [Podman](https://podman.io): Open source container engine for rootless containers.
- [SigNoz](https://signoz.io): OpenTelemetry-compatible observability backend.

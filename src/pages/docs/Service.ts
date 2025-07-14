import {cache, cacheSkip, span} from '@trifrost/core';
import {type Context} from '../../types';
import {Markdown} from '../../utils/Markdown';
import {isNeString} from '@valkyriestudios/utils/string';
import {siteMapEntry} from '../../utils/sitemap';

const ROUTES = [
  {
    title: 'Introduction',
    slug: 'introduction',
    items: [
      {
        title: 'What is TriFrost?',
        slug: 'what-is-trifrost',
        desc: 'An overview of the TriFrost framework, its purpose, and what makes it unique.',
      },
      {
        title: 'Core Principles',
        slug: 'core-principles',
        desc: "The guiding philosophies behind TriFrost's design, including no-magic, performance, and type safety.",
      },
      {
        title: 'Supported Runtimes',
        slug: 'supported-runtimes',
        desc: 'A detailed look at the environments where TriFrost runs: Node.js, Bun, and Cloudflare Workers.',
      },
    ],
  },
  {
    title: 'Getting Started',
    slug: 'getting-started',
    items: [
      {
        title: 'Hello World Example',
        slug: 'hello-world-example',
        desc: 'Build your first TriFrost app with a simple Hello World example.',
      },
      {
        title: 'CLI Quickstart',
        slug: 'cli-quickstart',
        desc: 'Get started with TriFrost in seconds using the official create-trifrost CLI — a zero-config scaffolder for modern runtimes.',
      },
      {
        title: 'Understanding Context',
        slug: 'understanding-context',
        desc: "Learn how TriFrost's context object works and how it flows through middleware and handlers.",
      },
      {
        title: 'Routing Basics',
        slug: 'routing-basics',
        desc: 'Understand how to define routes, use dynamic parameters, and chain handlers.',
      },
      {
        title: 'Middleware Basics',
        slug: 'middleware-basics',
        desc: "Introduction to writing and using middleware in TriFrost's composable pipeline.",
      },
    ],
  },
  {
    title: 'Core Concepts',
    slug: 'core-concepts',
    items: [
      {
        title: 'App & Router Structure',
        slug: 'app-router-structure',
        desc: 'Dive into the App class and Router system, and learn how they work together.',
      },
      {
        title: 'Context & State Management',
        slug: 'context-state-management',
        desc: 'Manage request-specific state, context injection, and data flow across handlers.',
      },
      {
        title: 'Dev Mode',
        slug: 'utils-devmode',
        desc: 'Learn how TriFrost detects development environments and how it affects logging, exporters, and runtime behavior.',
      },
      {
        title: 'Environment Variables',
        slug: 'utils-envvars',
        desc: 'Learn how TriFrost app configuration can be done through environment variables',
      },
      {
        title: 'Request Lifecycle',
        slug: 'request-response-lifecycle',
        desc: 'Explore the full lifecycle of a request and how TriFrost handles responses.',
      },
      {
        title: 'Error & 404 Handlers',
        slug: 'error-notfound-handlers',
        desc: 'Customize how your app handles errors and missing routes using .onError and .onNotFound.',
      },
      {
        title: 'Middleware Chains',
        slug: 'middleware-chains-symbols',
        desc: 'Understand the symbol-based tagging system and how middleware chains are built and inspected.',
      },
      {
        title: 'Logging & Observability',
        slug: 'logging-observability',
        desc: "Leverage TriFrost's built-in logging, tracing, and observability tools for better insights.",
      },
    ],
  },
  {
    title: 'JSX & Rendering',
    slug: 'jsx-rendering',
    items: [
      {
        title: 'JSX Basics',
        slug: 'jsx-basics',
        desc: 'Learn how JSX works in TriFrost and how to write components.',
      },
      {
        title: 'Fragments (Technical)',
        slug: 'jsx-fragments',
        desc: 'Learm more about the technical details of how JSX Fragment rendering works in TriFrost',
      },
      {
        title: 'Styling',
        slug: 'jsx-style-system',
        desc: 'Understand the CSS-in-JS system, how styles are scoped, media/pseudo support, ....',
      },
      {
        title: 'Scripting',
        slug: 'jsx-script-behavior',
        desc: 'Learn how to turn a static page into an interactive masterpiece using <Script /> and the atomic core.',
      },
      {
        title: '🧬 TriFrost Atomic',
        slug: 'jsx-atomic',
        desc: 'Learn about the TriFrost Atomic client-side runtime, where others ship megabyte bundles, we go atomic',
      },
    ],
  },
  {
    title: 'Runtime Guides',
    slug: 'runtime-guides',
    items: [
      {
        title: 'Node.js Runtime',
        slug: 'nodejs-runtime',
        desc: 'Guide for using TriFrost on Node.js, including server setup and best practices.',
      },
      {
        title: 'Bun Runtime',
        slug: 'bun-runtime',
        desc: 'Guide for running TriFrost on Bun, with details on performance and compatibility.',
      },
      {
        title: 'Cloudflare Workers',
        slug: 'cloudflare-workers-workerd',
        desc: 'Guide for using TriFrost on the edge using Cloudflare Workers and the Workerd runtime.',
      },
    ],
  },
  {
    title: 'API Reference',
    slug: 'api-reference',
    items: [
      {
        title: 'App',
        slug: 'app-class',
        desc: 'Full API details for the App class, including methods, properties, and usage.',
      },
      {
        title: 'Body Parsing',
        slug: 'bodyparsing',
        desc: 'Full API details for the Body parser system within TriFrost, including configuration and usage.',
      },
      {
        title: 'Cache',
        slug: 'cache-api',
        desc: "API reference for working with TriFrost's caching layer.",
      },
      {
        title: 'Context',
        slug: 'context-api',
        desc: 'Reference for the Context object, including available methods and properties.',
      },
      {
        title: 'Cookies',
        slug: 'cookies-api',
        desc: 'Reference for the Cookies module, including available methods and properties.',
      },
      {
        title: 'JWT',
        slug: 'jwt-api',
        desc: 'Reference for the JWT module, including available methods such as jwtVerify, jwtSign, jwtDecode.',
      },
      {
        title: 'Logger',
        slug: 'logger-api',
        desc: 'Detailed reference for the built-in logging and tracing system.',
      },
      {
        title: 'Logger: Console',
        slug: 'exporters-console',
        desc: 'Reference for the console exporter logging module',
      },
      {
        title: 'Logger: JSON',
        slug: 'exporters-json',
        desc: 'Reference for the json exporter logging module',
      },
      {
        title: 'Logger: OtelHttp',
        slug: 'exporters-otel',
        desc: 'Reference for the otel exporter logging module',
      },
      {
        title: 'Middleware: Auth',
        slug: 'middleware-api-auth',
        desc: 'API details for the auth middleware in TriFrost.',
      },
      {
        title: 'Middleware: Cache Control',
        slug: 'middleware-api-cache-control',
        desc: 'API details for the cache control middleware in TriFrost.',
      },
      {
        title: 'Middleware: Cors',
        slug: 'middleware-api-cors',
        desc: 'API details for the cors middleware in TriFrost.',
      },
      {
        title: 'Middleware: Security',
        slug: 'middleware-api-security',
        desc: 'API details for the security middleware, including CSP headers and automatic nonce generation for inline scripts.',
      },
      {
        title: 'Rate Limiting',
        slug: 'ratelimiting-api',
        desc: 'Detailed reference for the built-in rate limiting system.',
      },
      {
        title: 'Router & Route',
        slug: 'router-route',
        desc: 'Detailed reference for the Router and Route APIs, covering routing methods and hooks.',
      },
    ],
  },
];

export type Doc = (typeof ROUTES)[number]['items'][number] & {
  group: string;
  next: Doc | null;
  previous: Doc | null;
  to: string;
};

const ROUTES_FLATTENED: Map<string, Doc> = new Map();
let previous: Doc | null = null;
for (let i = 0; i < ROUTES.length; i++) {
  const el = ROUTES[i];
  for (let y = 0; y < el.items.length; y++) {
    const cursor = el.items[y] as Doc;
    cursor.to = `/docs/${cursor.slug}`;
    if (previous) previous.next = el.items[y] as Doc;
    cursor.group = el.slug;
    ROUTES_FLATTENED.set(cursor.slug, cursor);
    cursor.previous = previous;
    previous = cursor;
  }
}

export class DocsService {
  static root() {
    return [...ROUTES_FLATTENED.values()][0];
  }

  static list() {
    return ROUTES;
  }

  /**
   * Retrieve the entry from our flattened routes
   */
  static one<State extends {slugId: string}>(ctx: Context<State>): Doc | null {
    if (!isNeString(ctx.state.slugId)) return null;

    return ROUTES_FLATTENED.get(ctx.state.slugId) || null;
  }

  /**
   * Load up the body from storage
   */
  @span('getDoc')
  @cache(ctx => `doc:${ctx.state.slugId}`, {ttl: 86400})
  static async load<State extends {slugId: string}>(ctx: Context<State>) {
    try {
      /* Try to load asset */
      const resp = await ctx.env.ASSETS.fetch(`https://assets/9b693e73-9696-4daf-a3ec-ab591897c528/${ctx.state.slugId}.md`);
      if (!resp.ok) throw new Error('Failed to fetch doc asset');

      /* Load data */
      const body = await resp.text();
      if (!isNeString(body)) throw new Error('Markdown is empty');

      return {tree: Markdown.toTree(body)};
    } catch (err) {
      ctx.logger.error(err, {slugId: ctx.state.slugId});
      return cacheSkip(null);
    }
  }

  /**
   * Builds the sitemap for the docs section
   */
  static async siteMap() {
    const acc: string[] = [];
    for (const el of ROUTES_FLATTENED.values()) acc.push(siteMapEntry(el.to));
    return acc;
  }

  /**
   * Evicts the cache
   *
   * @param {Context} ctx
   */
  static async evict(ctx: Context) {
    /* Note how we're using prefix cache eviction here */
    await ctx.cache.del({prefix: 'doc:'});
  }
}

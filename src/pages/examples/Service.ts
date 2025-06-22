import {cache, cacheSkip, span} from '@trifrost/core';
import {type Context} from '../../types';
import {Markdown} from '../../utils/Markdown';
import {isNeString} from '@valkyriestudios/utils/string';
import {siteMapEntry} from '../../utils/sitemap';
import {HTMX, NodeJS, TriFrost} from '../../components/atoms/Icons';

export type Example = {
  slug: string;
  title: string;
  desc: string;
  tags: string[];
  live: string;
  logo1: JSX.Element;
  logo2: JSX.Element;
  to: string;
  screenshots: {file: string; title: string}[];
};

const EXAMPLES = [
  {
    slug: 'trifrost_htmx_todos',
    title: 'TriFrost + HTMX Todo App',
    desc: 'A fully interactive, stateful todo application using TriFrost with HTMX, running on the edge.',
    tags: ['HTMX', 'JSX', 'CloudFlare', 'DurableObject', 'UpTrace'],
    live: 'https://htmx-todos.trifrost.dev/',
    logo1: TriFrost,
    logo2: HTMX,
    screenshots: [
      {
        file: 'htmx_todos_view.png',
        title: 'Homepage of the example',
      },
      {
        file: 'htmx_todos_tracing.png',
        title: 'Example Uptrace Otel Logs',
      },
    ],
  },
  {
    slug: 'trifrost_node_mini_site',
    title: 'Mini Site (Node + Podman)',
    desc: 'A container-ready, multi-page TriFrost example with HTMX, theming, and observability.',
    tags: ['Node.js', 'Podman', 'HTMX', 'JSX', 'SigNoz'],
    live: 'https://website-node-container.trifrost.dev/',
    logo1: TriFrost,
    logo2: NodeJS,
    screenshots: [
      {
        file: 'trifrost_node_mini_site_dark.png',
        title: 'Dark mode version of the homepage',
      },
      {
        file: 'trifrost_node_mini_site_light.png',
        title: 'Light mode version of the homepage',
      },
    ],
  },
] as unknown as Example[];

for (let i = 0; i < EXAMPLES.length; i++) {
  const cursor = EXAMPLES[i] as Example;
  cursor.to = `/examples/${cursor.slug}`;
}

export class ExamplesService {
  static list() {
    return EXAMPLES;
  }

  /**
   * Retrieve the entry from our flattened routes
   */
  static one<State extends {slugId: string}>(ctx: Context<State>): Example | null {
    if (!isNeString(ctx.state.slugId)) return null;

    return EXAMPLES.find(el => el.slug === ctx.state.slugId) || null;
  }

  /**
   * Load up the body from storage
   */
  @span('getExample')
  @cache(ctx => `example:${ctx.state.slugId}`, {ttl: 86400})
  static async load<State extends {slugId: string}>(ctx: Context<State>) {
    try {
      /* Try to load asset */
      const resp = await ctx.env.ASSETS.fetch(`https://assets/adc0b918-84c6-4474-9269-a48fac8755cc/${ctx.state.slugId}.md`);
      if (!resp.ok) throw new Error('Failed to fetch example asset');

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
   * Builds the sitemap for the examples section
   */
  static async siteMap() {
    const acc: string[] = [];
    for (const el of EXAMPLES) acc.push(siteMapEntry(el.to));
    return acc;
  }

  /**
   * Evicts the cache
   *
   * @param {Context} ctx
   */
  static async evict(ctx: Context) {
    /* Note how we're using prefix cache eviction here */
    await ctx.cache.del({prefix: 'example:'});
  }
}

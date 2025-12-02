import {span} from '@trifrost/core';
import {type Context} from '../../../types';
import {isNeString} from '@valkyriestudios/utils/string';

export type CompactBlog = {
  type: 'blog';
  slug: string;
  title: string;
  desc: string;
  date: number;
  to: string;
};

export type FullBlog = CompactBlog & {
  body: string;
  author_name: string;
  author_link: string;
};

const getLink = (val: {slug: string}) => `/news/blog/${val.slug}`;

// The source of truth for all blog post metadata
const BLOG_METADATA: {
  type: string;
  slug: string;
  title: string;
  desc: string;
  date: Date;
  author_name: string;
  author_link: string;
}[] = [
  {
    type: 'blog',
    slug: '1_0_end_of_the_beginning',
    title: '1.0: The End of the Beginning',
    desc: 'After 173 releases, it’s finally time. The foundation is set, fast, typed, portable',
    date: new Date('2025-07-15 15:30:12.178+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'atomic_arcade_fragments_in_motion',
    title: 'Atomic Arcade: Fragments in Motion',
    desc: 'Over the past few weeks, you might’ve noticed a steady stream of TriFrost releases. If you were wondering what prompted the pace, the answer is simple: I needed something to break.',
    date: new Date('2025-07-09 13:54:41.922+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'atomic_zero_cost_abstractions_for_the_modern_web',
    title: 'Atomic: Zero-Cost Abstractions for the Modern Web',
    desc: 'Atomic is fast, invisible, and predictable — doing the hard parts behind the scenes so your HTML stays lean and your runtime stays sharp.',
    date: new Date('2025-06-21 16:13:41.504+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'auth_signed_cookies_and_whats_next',
    title: 'Auth, Signed Cookies, and What’s Next',
    desc: 'TriFrost 0.18.0 (FrostBite) is here, bringing production-ready authentication into the framework. This release adds: ...',
    date: new Date('2025-05-25 17:43:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'goodbye_htmx_hello_script',
    title: 'Goodbye HTMX, Hello <Script>',
    desc: 'TriFrost just got a little leaner, a little cleaner — and a lot more native.',
    date: new Date('2025-06-15 15:00:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'hello_world_benchmark_trifrost',
    title: 'Hello, World. Hello, Speed.',
    desc: 'We benchmarked TriFrost against Elysia, Hono, Koa, and Express in a head-to-head hello world shootout. The results? Frosty.',
    date: new Date('2025-06-04 13:30:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'how_atomic_is_trifrost_atomic',
    title: 'How Atomic is TriFrost Atomic?',
    desc: 'A blazing-fast, CSP-safe scripting runtime that does more with less, no compilers, no bundlers, just pure atomic power.',
    date: new Date('2025-07-01 13:37:15.715+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'june_2025_progress_update',
    title: 'June 2025 Progress Update',
    desc: 'Docs, coverage, real users — TriFrost is taking shape and picking up steam.',
    date: new Date('2025-06-13 20:00:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'open_sourcing_the_site',
    title: 'Open Sourcing the TriFrost Website',
    desc: 'TriFrost.dev is now fully open source, same code, same deploys, same streaming, markdown, and telemetry setup. See how TriFrost works in the real world.',
    date: new Date('2025-06-17 12:56:33.291+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'road_to_1_0',
    title: 'Road to 1.0',
    desc: 'TriFrost has been evolving quickly — modular routing, runtime flexibility, solid developer ergonomics. But a 1.0 release sets a higher bar: stability, confidence, and a contract with its users ...',
    date: new Date('2025-05-12 09:30:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'two_days_one_rewrite',
    title: 'Two Days, One Rewrite',
    desc: 'I rewrote the entire TriFrost website’s styling in a day. No SCSS pipeline. No cascade overrides. No build steps. Just createCss(), use(), mix(), and a bit of media logic ...',
    date: new Date('2025-05-21 22:19:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'wax_on_wax_off_sharpening_trifrost',
    title: 'Wax On, Wax Off: Sharpening TriFrost',
    desc: 'There’s something deeply satisfying about refinement — the slow, careful polishing of a tool you already trust. That’s exactly where TriFrost is right now. ...',
    date: new Date('2025-06-01 14:39:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
  {
    type: 'blog',
    slug: 'why_trifrost_exists',
    title: 'Why TriFrost exists?',
    desc: 'TriFrost started with a simple question: why are most backend frameworks either too rigid, too leaky, or locked to a single runtime? ...',
    date: new Date('2025-05-07 18:15:00+00'),
    author_name: 'Peter V.',
    author_link: 'https://github.com/peterver',
  },
];

export class BlogService {
  /**
   * Retrieves all blog metadata from the local list
   * @param {Context} ctx
   */
  @span('getBlogsList')
  static async list(): Promise<CompactBlog[]> {
    return BLOG_METADATA.map(row => ({
      ...row,
      date: row.date.valueOf(),
      to: getLink(row),
      type: 'blog' as CompactBlog['type'],
    })).sort((a, b) => b.date - a.date); // Sort by date descending
  }

  /**
   * Retrieves a single blog (metadata + body)
   * @param {Context} ctx
   */
  @span('getBlog')
  static async one<S extends {slugId: string}>(ctx: Context<S>): Promise<FullBlog | null> {
    if (!isNeString(ctx.state.slugId)) return null;

    const metadata = BLOG_METADATA.find(b => b.slug === ctx.state.slugId);
    if (!metadata) return null;

    const bodyData = await this.loadBody(ctx, metadata.slug);
    if (!bodyData) return null;

    return {
      type: 'blog',
      slug: metadata.slug,
      title: metadata.title,
      desc: metadata.desc,
      date: metadata.date.valueOf(),
      to: getLink(metadata),
      author_name: metadata.author_name,
      author_link: metadata.author_link,
      body: bodyData.body,
    };
  }

  /**
   * Load up the blog post body from asset storage
   * This is cached for 24 hours (86400s) as blog posts are static.
   */
  @span('loadBlogBody')
  private static async loadBody<State extends {slugId: string}>(ctx: Context<State>, slug: string): Promise<{body: string} | null> {
    try {
      /* Try to load asset from the blogs/ directory */
      // Assuming your asset path follows the pattern: blogs/{slug}.md
      const resp = await ctx.env.ASSETS.fetch(`https://assets/blogs/${slug}.md`);

      if (!resp.ok) throw new Error(`Failed to fetch blog asset: ${slug}`);

      /* Load data */
      const body = await resp.text();
      if (!isNeString(body)) throw new Error('Markdown body is empty');

      return {body};
    } catch (err) {
      ctx.logger.error(err, {slug});
      return null;
    }
  }
}

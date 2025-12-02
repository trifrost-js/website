import {type Context} from '../../../types';
import {cache, span} from '@trifrost/core';
import {Markdown} from '../../../utils/Markdown';

const GITHUB_REPO = 'trifrost-js/core';
const RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`;
const SINGLE_RELEASE_URL = (tag: string) => `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${tag}`;

type RawGitHubRelease = {
  tag_name: string;
  name: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  body: string;
  body_html: string;
  published_at: string;
  html_url: string;
};

export type CompactRelease = {
  type: 'release';
  slug: string;
  title: string;
  desc: string | null;
  date: number;
  to: string;
};

export type FullRelease = CompactRelease & {
  author_name: string;
  author_link: string;
  body: string;
  link: string;
};

export const LIST_CACHE_KEY = 'releases-list';
export const SINGLE_CACHE_KEY = 'release-single';

const getLink = (slug: string) => `/news/releases/${slug}`;

export class ReleaseService {
  /**
   * Retrieves releases from GitHub (cached)
   */
  @span('getReleases')
	@cache('news:releases:__all__', {ttl: 60*60*24})
  static async list(ctx: Context): Promise<CompactRelease[]> {
    const releases = await this.fetchListFromGithub(ctx);

    // Map the FullRelease down to CompactRelease to match original signature
    return releases.map(r => ({
      type: 'release',
      slug: r.slug,
      title: r.title,
      desc: r.desc,
      date: r.date,
      to: r.to,
    }));
  }

  /**
   * Retrieves a single release from GitHub (cached)
   */
  @span('getRelease')
	@cache(ctx => `news:releases:${ctx.state.slugId}`, {ttl: 60*60*24})
  static async one<S extends {slugId: string}>(ctx: Context<S>): Promise<FullRelease | null> {
    return this.fetchOneFromGithub(ctx, ctx.state.slugId);
  }

  /**
   * Fetch all releases logic, cached by @cache decorator
   */
  @span('fetchReleasesListFromGithub')
  private static async fetchListFromGithub(ctx: Context): Promise<FullRelease[]> {
    const res = await ctx.fetch(RELEASES_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${ctx.env.GITHUB_API_TOKEN}`,
        'User-Agent': 'TrifrostJs/core',
      },
    });

    if (!res.ok) {
      ctx.logger.error('GitHub releases list fetch failed', {text: await res.text()});
      return [];
    }

    const raw = (await res.json()) as RawGitHubRelease[];
    if (!Array.isArray(raw)) return [];

    return raw.map(r => this.mapGithubRelease(r));
  }

  /**
   * Fetch single release logic, cached by @cache decorator
   */
  @span('fetchSingleReleaseFromGithub')
  private static async fetchOneFromGithub(ctx: Context, slug: string): Promise<FullRelease | null> {
    const res = await ctx.fetch(SINGLE_RELEASE_URL(slug), {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${ctx.env.GITHUB_API_TOKEN}`,
        'User-Agent': 'TrifrostJs/core',
      },
    });

    if (!res.ok) {
      if (res.status !== 404) {
        ctx.logger.error('GitHub single release fetch failed', {slug, text: await res.text()});
      }
      return null;
    }

    const raw = (await res.json()) as RawGitHubRelease;
    return this.mapGithubRelease(raw);
  }

  /**
   * Helper to map raw GitHub data to internal FullRelease type
   */
  private static mapGithubRelease(r: RawGitHubRelease): FullRelease {
    const slug = r.tag_name;
    return {
      type: 'release',
      slug: slug,
      title: `TriFrost ${r.name}`,
      // Reuse your existing Markdown util
      desc: Markdown.getIntroFromTree(Markdown.toTree(r.body)),
      date: new Date(r.published_at).valueOf(),
      to: getLink(slug),
      author_name: r.author.login,
      author_link: r.author.html_url,
      body: r.body,
      link: r.html_url,
    };
  }
}

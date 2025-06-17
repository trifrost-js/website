import {neon, Pool} from '@neondatabase/serverless';
import {type Context} from '../../../types';
import {span} from '@trifrost/core';
import {Markdown} from '../../../utils/Markdown';

const GITHUB_REPO = 'trifrost-js/core';
const RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=100`;

type RawGitHubRelease = {
	tag_name:string;
	name:string;
	author: {
		login:string;
		avatar_url:string;
		html_url:string
	};
	body:string;
	body_html:string;
	published_at:string;
	html_url:string
};

export type CompactRelease = {
	type: 'release';
	slug: string;
	title: string;
	desc: string|null;
	date: number;
	to:string;
};

export type FullRelease = CompactRelease & {
	author_name:string;
	author_link:string;
	body:string;
	link:string;
};

export const CACHE_KEY = 'releases';

const getLink = (val:CompactRelease) => `/news/releases/${val.slug}`;

export class ReleaseService {

	/**
	 * Retrieves releases from postgress
	 * @param {Context} ctx
	 */
	@span('getReleases')
    static async list (ctx:Context):Promise<CompactRelease[]> {
        try {
            const rows = (await neon(ctx.env.DB_CONNECTION_STRING).query(`
				SELECT r.slug, r.title, r.desc, r.date
				FROM public.releases AS r
				ORDER BY r.date DESC
			`)) as CompactRelease[];

            return rows.map(row => ({
                ...row,
                to: getLink(row),
                date: new Date(row.date).valueOf(),
                type: 'release',
            }));
        } catch (err) {
            ctx.logger.error(err);
            return [];
        }
    }

	/**
	 * Retrieves a single release from postgress
	 * @param {Context} ctx
	 */
	@span('getRelease')
	static async one <S extends {slugId:string}> (ctx:Context<S>) {
	    try {
	        const sql = neon(ctx.env.DB_CONNECTION_STRING);
	        const rows = (await sql.query(
	            `SELECT
				r.slug,
				r.title,
				r.desc,
				r.date,
				r.body,             -- stored markdown
				r.link,
				a.name  AS author_name,
				a.link  AS author_link
				FROM public.releases AS r
				LEFT JOIN public.authors AS a ON r.author_id = a.id
				WHERE r.slug = $1`,
	            [ctx.state.slugId]
	        )) as FullRelease[];
	        if (!rows.length) return null;

	        return {
	            ...rows[0],
	            type: 'release',
	            to: getLink(rows[0]),
	        };
	    } catch (err) {
	        ctx.logger.error(err, {slugId: ctx.state.slugId});
	        return null;
	    }
	}

	/** Fetch all releases from GitHub and upsert into Postgres */
	@span('syncReleasesToDb')
	static async syncToDb (ctx:Context) {
		// Step 1: Fetch releases directly from GitHub
	    const res = await ctx.fetch(RELEASES_URL, {
	        method: 'GET',
	        headers: {
			  Accept: 'application/vnd.github.v3+json',
			  Authorization: `Bearer ${ctx.env.GITHUB_API_TOKEN}`,
			  'User-Agent': 'TrifrostJs/core',
	        },
	    });

	    if (!res.ok) {
	        ctx.logger.error('GitHub releases fetch failed', {text: await res.text()});
	        return 0;
	    }

	    const raw = (await res.json()) as RawGitHubRelease[];
	    if (!Array.isArray(raw)) return 0;

		// 2. Build release data and collect unique authors
	    const releases: {
			slug: string;
			title: string;
			desc: string | null;
			date: Date;
			author_name: string;
			author_link: string;
			body_md: string;
			link: string;
		}[] = [];

	    const authors = new Map<string, {name:string; link:string}>();
	    for (const r of raw) {
	        const name = r.author.login;
	        const link = r.author.html_url;
	        if (!authors.has(link)) authors.set(link, {name, link});

	        releases.push({
	            slug: r.tag_name,
	            title: `TriFrost ${r.name}`,
	            desc: Markdown.getIntroFromTree(Markdown.toTree(r.body)),
	            date: new Date(r.published_at),
	            author_name: name,
	            author_link: link,
	            body_md: r.body,
	            link: r.html_url,
	        });
	    }
	    if (!releases.length) return 0;

	    const pool = new Pool({connectionString: ctx.env.DB_CONNECTION_STRING});
	    const client = await pool.connect();
	    try {
			// 3. Query authors in bulk
	        const {rows: existingAuthors} = await client.query<{id:string; link:string}>(
	            'SELECT id, link FROM authors WHERE link = ANY($1::text[])',
	            [[...authors.keys()]]
	        );

	        const authorMap = new Map<string, string>(); // link -> id
	        for (const row of existingAuthors) authorMap.set(row.link, row.id);

			// 4. Insert missing authors
	        const newAuthors = [...authors.values()].filter(el => !authorMap.has(el.link));
	        for (const el of newAuthors) {
	            const id = crypto.randomUUID();
	            await client.query(`
					INSERT INTO public.authors (id, name, link)
					VALUES ($1, $2, $3)
					ON CONFLICT (name, link) DO NOTHING
				`, [id, el.name, el.link]);
	            authorMap.set(el.link, id);
	        }

			// 5. Insert or update releases
	        const rows = releases.map(r => [
	            r.slug,
	            r.title,
	            r.desc,
	            r.date,
				authorMap.get(r.author_link)!,
				r.body_md,
				r.link,
	        ]);

	        await client.query(`
				INSERT INTO public.releases (
					slug, title, "desc", date, author_id, body, link
				)
				VALUES ${rows
        .map((_top, i) => `(${[...Array(7)].map((_, j) => `$${(i*7) + j + 1}`).join(', ')})`)
        .join(', ')}
				ON CONFLICT (slug) DO UPDATE SET
					title     = EXCLUDED.title,
					"desc"    = EXCLUDED."desc",
					date      = EXCLUDED.date,
					author_id = EXCLUDED.author_id,
					body   	  = EXCLUDED.body,
					link      = EXCLUDED.link;
			`, rows.flat());

	        return releases.length;
	    } finally {
	        client.release();
	    }
	}

}

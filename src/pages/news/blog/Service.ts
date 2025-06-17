import {neon} from '@neondatabase/serverless';
import {span} from '@trifrost/core';
import {type Context} from '../../../types';

export type CompactBlog = {
	type:'blog';
	slug:string;
	title:string;
	desc:string;
	date:number;
	to:string;
}

export type FullBlog = CompactBlog & {
	body:string;
	author_name:string;
	author_link:string;
};

const getLink = (val:CompactBlog) => `/news/blog/${val.slug}`;

export class BlogService {

	/**
	 * Retrieves blogs from postgress
	 * @param {Context} ctx
	 */
	@span('getBlogs')
	static async list (ctx:Context):Promise<CompactBlog[]> {
		try {
			const posts = await neon(ctx.env.DB_CONNECTION_STRING).query(`
				SELECT b.slug, b.title, b.desc, b.date
				FROM public.blogs as b
			`) as CompactBlog[];
			return posts.map(row => ({
				...row,
				date: new Date(row.date).valueOf(),
				to: getLink(row),
				type: 'blog',
			}));
		} catch (err) {
			ctx.logger.error(err);
			return [];
		}
	}

	/**
	 * Retrieves a single blog from postgress
	 * @param {Context} ctx
	 */
	@span('getBlog')
	static async one <S extends {slugId:string}> (ctx:Context<S>) {
		try {
			const rows = await neon(ctx.env.DB_CONNECTION_STRING).query(`
				SELECT
					b.slug,
					b.title,
					b.desc,
					b.date,
					b.body,
					a.name AS author_name,
					a.link AS author_link
				FROM public.blogs as b
				LEFT JOIN public.authors as a
				ON b.author_id = a.id
				WHERE b.slug = $1
			`, [ctx.state.slugId]) as FullBlog[];
			if (!rows.length) return null;

			return {
				...rows[0],
				to: getLink(rows[0]),
				type: 'blog',
			};
		} catch (err) {
			ctx.logger.error(err, {slugId: ctx.state.slugId});
			return null;
		}
	}
}

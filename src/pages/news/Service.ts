import {sort} from '@valkyriestudios/utils/array';
import {cache, cacheSkip, span} from '@trifrost/core';
import {type Context} from '../../types';
import {BlogService, type CompactBlog} from './blog/Service';
import {ReleaseService, type CompactRelease} from './releases/Service';
import {siteMapEntry} from '../../utils/sitemap';

export type NewsItem = CompactBlog | CompactRelease;

export class NewsService {

	/**
	 * Retrieves list of all news
	 * @param {Context} ctx
	 */
	@span('getNews')
	@cache('news', {ttl: 7200})
    static async list (ctx:Context):Promise<NewsItem[]> {
        try {
            return sort([
                ...await ReleaseService.list(ctx),
                ...await BlogService.list(ctx),
            ], 'date', 'desc');
        } catch (err) {
            ctx.logger.error(err);
            return cacheSkip([]);
        }
    }

	/**
	 * Retrieves the next and previous items for a news entry
	 *
	 * @param {Context} ctx
	 * @param {string} slug
	 */
	static async nextPrevious (ctx:Context, slug:string) {
	    const list = await NewsService.list(ctx);
	    const idx = list.findIndex(el => el.slug === slug);

	    return {
	        previous: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
	        next: idx > 0 ? list[idx - 1] : null,
	    };
	}

	/**
	 * Builds the sitemap for the news section
	 *
	 * @param {Context} ctx
	 */
	static async siteMap (ctx:Context) {
	    const list = await NewsService.list(ctx);
	    const acc:string[] = [siteMapEntry('/news')];
	    for (let i = 0; i < list.length; i++) acc.push(siteMapEntry(list[i].to, new Date(list[i].date)));
	    return acc;
	}

	/**
	 * Evicts the cache
	 *
	 * @param {Context} ctx
	 */
	static async evict (ctx:Context) {
	    await ctx.cache.del('news');
	}

}

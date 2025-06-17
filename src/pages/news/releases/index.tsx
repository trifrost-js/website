import {type Router} from '../../../types';
import {Layout} from '../../../components/layout/Layout';
import {Back} from '../../../components/atoms/Back';
import {Page} from '../../../components/molecules/Page';
import {ShareThis} from '../../../components/molecules/ShareThis';
import {NextPrevious} from '../../../components/molecules/NextPrevious';
import {css} from '../../../css';
import {Separator} from '../../../components/atoms/Separator';
import {Article} from '../../../components/molecules/Article';
import {Time} from '../../../components/atoms/Time';
import {Markdown} from '../../../utils/Markdown';
import {ReleaseService} from './Service';
import {NewsService} from '../Service';

export async function releaseRouter <State extends {}> (r:Router<State>) {
	r
		.get('/:slugId', async (ctx) => {
			/* Ensure semver */
			if (!/^(\d+)\.(\d+)\.(\d+)$/.test(ctx.state.slugId)) return ctx.redirect('/news');

			/* Load release, if not found 404 */
			const release = await ReleaseService.one(ctx);
			if (!release) return ctx.setStatus(404);

			const {next, previous} = await NewsService.nextPrevious(ctx, ctx.state.slugId);

			return ctx.html(<Layout title={release.title} description={release.desc} section="news">
				<Page style={{paddingTop: css.$v.space_xl}}>
					<h1 className={css.use('text_page_title', 'sm_t_l', 'sm_b_m', {textAlign: 'center'})}>{release.title}</h1>
					<p className={css.use('f', 'fa_c', 'fj_c', {
						maxWidth: '65rem',
						[css.media.desktop]: css.mix('fh'),
						[css.media.tabletOnly]: css.mix('fh'),
						[css.media.mobile]: css.mix('fv', {gap: css.$v.space_s}),
					})}>
						<Time date={release.date} format="dddd, MMMM D, YYYY" style={css.mix('text_body_thin')} />
						<Separator style={{[css.media.mobile]: css.mix('hide')}} />
						<a className={css.use('text_body_thin', {color: css.$t.body_fg})} href={release.author_link} target="_blank">{release.author_name}</a>
					</p>
					<Article style={{
						[css.media.desktop]: css.mix('sm_v_xl'),
						[css.media.tablet]: css.mix('sm_t_xl'),
					}}>
						<Back to="/news" label="News" />
						{Markdown.renderTree(Markdown.toTree(release.body))}
						<NextPrevious next={next} previous={previous} />
					</Article>
					<ShareThis url={ctx.path} title={release.title}/>
				</Page>
			</Layout>);
		});
}

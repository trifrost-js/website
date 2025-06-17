import {type Router} from '../../../types';
import {Layout} from '../../../components/layout/Layout';
import {Page} from '../../../components/molecules/Page';
import {Back} from '../../../components/atoms/Back';
import {css} from '../../../css';
import {Article} from '../../../components/molecules/Article';
import {Time} from '../../../components/atoms/Time';
import {Separator} from '../../../components/atoms/Separator';
import {Markdown} from '../../../utils/Markdown';
import {ShareThis} from '../../../components/molecules/ShareThis';
import {NextPrevious} from '../../../components/molecules/NextPrevious';
import {BlogService} from './Service';
import {NewsService} from '../Service';

export async function blogRouter <State extends Record<string, unknown>> (r:Router<State>) {
    r
        .get('/:slugId', async ctx => {
            if (!/^[a-zA-Z0-9_-]{1,128}$/.test(ctx.state.slugId)) return ctx.redirect('/news');

            const blog = await BlogService.one(ctx);
            if (!blog) return ctx.setStatus(404);

            const {next, previous} = await NewsService.nextPrevious(ctx, blog.slug);

            return ctx.html(<Layout title={blog.title} description={blog.desc} section="news">
                <Page style={{paddingTop: css.$v.space_xl}}>
                    <h1 className={css.use('text_page_title', 'sm_b_m', {textAlign: 'center'})}>{blog.title}</h1>
                    <p className={css.use('f', 'fa_c', 'fj_c', {
                        maxWidth: '65rem',
                        [css.media.desktop]: css.mix('fh'),
                        [css.media.tablet]: css.mix('fv', {gap: css.$v.space_s}),
                    })}>
                        <Time date={blog.date} format="dddd, MMMM D, YYYY" style={css.mix('text_body_thin')} />
                        <Separator style={{[css.media.tablet]: css.mix('hide')}} />
                        <a className={css.use('text_body_thin', {color: css.$t.body_fg})} href={blog.author_link} target="_blank">
                            {blog.author_name}
                        </a>
                    </p>
                    <Article style={{
                        [css.media.desktop]: css.mix('sm_v_xl'),
                        [css.media.tablet]: css.mix('sm_t_xl'),
                    }}>
                        <Back to="/news" label="News" />
                        {Markdown.renderTree(Markdown.toTree(blog.body))}
                        <NextPrevious next={next} previous={previous} />
                    </Article>
                    <ShareThis url={ctx.path} title={blog.title}/>
                </Page>
            </Layout>);
        });
}

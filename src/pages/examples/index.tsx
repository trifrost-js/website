import {css} from '../../css';
import {Badge} from '../../components/atoms/Badge';
import {Collapsible} from '../../components/atoms/Collapsible';
import {HighLight} from '../../components/atoms/HighLight';
import {HTMX, NodeJS, TriFrost} from '../../components/atoms/Icons';
import {Layout} from '../../components/layout/Layout';
import {type Router} from '../../types';
import {PreviewHeader} from './components/Preview';
import {Back} from '../../components/atoms/Back';
import {Page} from '../../components/molecules/Page';
import {Article} from '../../components/molecules/Article';
import {Button} from '../../components/atoms/Button';
import {Picture} from '../../components/atoms/Picture';
import {Panel} from '../../components/molecules/Panel';
import {ShareThis} from '../../components/molecules/ShareThis';
import {siteMapEntry} from '../../utils/sitemap';

const RGX_EXAMPLESLUG = /^[a-zA-Z0-9_-]{1,128}$/;

export async function examplesRouter<State extends Record<string, unknown>>(r: Router<State>) {
  r.get('', async ctx =>
    ctx.html(
      <Layout title="TriFrost Examples" description="A running log of what’s new in TriFrost" section="examples">
        <Page width={'130rem'}>
          <div className={css.use('sp_v_xl', 'sm_h_s', {textAlign: 'center'})}>
            <h1 className={css.use('text_page_title', 'sm_b_m')}>TriFrost Examples</h1>
            <p className={css.use('text_header_thin', {lineHeight: 1.4, maxWidth: '65rem'})}>
              A growing set of real-world examples built with TriFrost. Showcasing patterns, integrations & ideas.
            </p>
          </div>
          <div
            className={css.use('f', {
              width: '100%',
              [css.media.desktop]: css.mix('fh', 'fw', 'fg', {gap: css.$v.space_l}),
              [css.media.tablet]: css.mix('fv', {gap: css.$v.space_s}),
            })}
          >
            {EXAMPLES.map((el, idx) => (
              <Panel
                key={idx}
                style={css.mix('f', 'fv', {
                  [css.media.desktop]: {width: 'calc(50% - ' + css.$v.space_l + ')'},
                  [css.media.tablet]: {width: '100%'},
                })}
                to={`/examples/${el.slug}`}
                alt={el.title}
              >
                <PreviewHeader {...el.preview()} />
                <div
                  className={css.use('f', 'fv', 'fg', 'sm_t_l', {
                    gap: css.$v.space_m,
                    [css.media.mobile]: {gap: css.$v.space_s},
                  })}
                >
                  <h3 className={css.use('text_header')}>{el.title}</h3>
                  <p className={css.use('text_body', {lineHeight: 1.4})}>{el.desc}</p>
                  <div className={css.use('f', 'fh', 'fw', 'fa_c', 'sm_t_xs', 'fj_l', {gap: css.$v.space_xs})}>
                    {el.tags.map(tag => (
                      <Badge>{tag}</Badge>
                    ))}
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </Page>
      </Layout>,
    ),
  )
    .get('/:slugId', async ctx => {
      if (!RGX_EXAMPLESLUG.test(ctx.state.slugId)) return ctx.redirect('/examples');

      const example = EXAMPLES.find(el => el.slug === ctx.state.slugId);
      if (!example) return ctx.setStatus(404);

      return ctx.html(
        <Layout title={example.title} description={example.desc} section="examples">
          <Page>
            <Article
              style={{
                [css.media.desktop]: css.mix('sm_b_xl'),
                [css.media.tablet]: css.mix('sm_t_l'),
              }}
            >
              <Back to="/examples" label="Examples" />
              {example.body()}
            </Article>
            <ShareThis url={ctx.path} title={example.title} />
          </Page>
        </Layout>,
      );
    })
    .get('/:slugId/download', async ctx => {
      if (!RGX_EXAMPLESLUG.test(ctx.state.slugId)) return ctx.redirect('/examples');

      const example = EXAMPLES.find(el => el.slug === ctx.state.slugId);
      if (!example) return ctx.status(404);

      return ctx.file(example.download, {download: `${example.title}.zip`});
    });
}

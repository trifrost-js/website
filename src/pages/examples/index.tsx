import {css} from '../../css';
import {Badge} from '../../components/atoms/Badge';
import {Layout} from '../../components/layout/Layout';
import {type Router} from '../../types';
import {Article} from '../../components/molecules/Article';
import {Page} from '../../components/molecules/Page';
import {Panel} from '../../components/molecules/Panel';
import {ShareThis} from '../../components/molecules/ShareThis';
import {Back} from '../../components/atoms/Back';
import {Markdown} from '../../utils/Markdown';
import {Button} from '../../components/atoms/Button';
import {PreviewHeader} from './components/Preview';
import {OnThisPage} from './components/OnThisPage';
import {ScreenShots} from './components/ScreenShots';
import {ExamplesService} from './Service';

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
            {ExamplesService.list().map((el, idx) => (
              <Panel
                key={idx}
                style={css.mix('f', 'fv', {
                  [css.media.desktop]: {width: 'calc(50% - ' + css.$v.space_l + ')'},
                  [css.media.tablet]: {width: '100%'},
                })}
                to={el.to}
                alt={el.title}
              >
                <PreviewHeader type={'small'} logo1={el.logo1} logo2={el.logo2} />
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
      const entry = ExamplesService.one(ctx);
      if (!entry) return ctx.setStatus(404);

      const example = await ExamplesService.load(ctx);
      if (!example) return ctx.setStatus(500);

      return ctx.html(
        <Layout title={entry.title} description={entry.desc} section="examples">
          <Page width={'130rem'}>
            <div className={css.use('f', 'fh', 'fg', 'fj_c', {width: '100%'})}>
              <div className={css.use('f', 'fv')}>
                <div
                  className={css.use('f', 'fv', {
                    gap: css.$v.space_m,
                    position: 'sticky',
                    zIndex: 10000,
                    top: css.$v.space_l,
                    [css.media.tablet]: css.mix('hide'),
                  })}
                >
                  <OnThisPage tree={example.tree} />
                  <ScreenShots entry={entry} />
                </div>
              </div>
              <div
                className={css.use('fg', {
                  [css.media.desktop]: {maxWidth: 'calc(130rem - 30rem)'},
                  [css.media.tablet]: {width: '100%'},
                })}
              >
                <Article
                  style={{
                    [css.media.desktop]: css.mix('sm_h_l', 'fg', 'sm_b_xl'),
                    [css.media.tablet]: css.mix('sm_t_l'),
                  }}
                >
                  <PreviewHeader type={'large'} logo1={entry.logo1} logo2={entry.logo2} />
                  <h1>{entry.title}</h1>
                  <div className={css.use('f', 'sm_t_s', 'sm_b_l', {gap: css.$v.space_s})}>
                    <Back to="/examples" label="Examples" />
                    <Button to={entry.live} label="View Live" size="s" blank={true} style={css.mix('sm_b_l')} />
                    <Button to={`/examples/${entry.slug}/download`} label="Download" size="s" style={css.mix('sm_b_l')} />
                  </div>
                  {Markdown.renderTree(example.tree)}
                </Article>
                <ShareThis url={ctx.path} title={entry.title} />
              </div>
            </div>
          </Page>
        </Layout>,
      );
    })
    .get('/:slugId/download', async ctx => {
      const entry = ExamplesService.one(ctx);
      if (!entry) return ctx.setStatus(404);

      return ctx.file(ExamplesService.asset(entry, 'download.zip'), {download: `${entry.title}.zip`});
    });
}

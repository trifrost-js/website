import {MimeTypes} from '@trifrost/core';
import {type Context, type Router} from '../../types';
import {Layout} from '../../components/layout/Layout';
import {TriFrost} from '../../components/atoms/Icons';
import {Button} from '../../components/atoms/Button';
import {GradientBorder} from '../../components/atoms/GradientBorder';
import {GridBackground} from '../../components/atoms/GridBackground';
import {Page} from '../../components/molecules/Page';
import {css} from '../../css';
import {Features} from './components/Features';
import {Benchmark} from './components/Benchmark';
import {Cli} from './components/CLI';
import {Arcade} from './components/Arcade';
import {ExamplesService} from '../examples/Service';
import {NewsService} from '../news/Service';
import {DocsService} from '../docs/Service';
import {siteMapEntry} from '../../utils/sitemap';

export async function getHome(ctx: Context) {
  return ctx.html(
    <Layout section="home">
      <Page style={{position: 'relative'}}>
        <GridBackground />
        <h1
          className={css.use('f', 'fa_c', 'fj_c', 'sm_b_l', {
            width: '100%',
            [css.media.desktop]: css.mix('fh', {marginTop: '10rem'}),
            [css.media.tablet]: css.mix('fv', 'sm_t_xl'),
          })}
        >
          <TriFrost width={100} />
          <span className={css.use('text_giga_title', 'sm_l_l')}>TriFrost</span>
        </h1>
        <p
          className={css.use('text_header_thin', 'sm_h_auto', {
            maxWidth: '65rem',
            textAlign: 'center',
            lineHeight: '140%',
          })}
        >
          Build ultra-fast, fully typed apps that run anywhere. With atomic fragments, runtime telemetry and SSR without compromise.
        </p>
        <div className={css.use('f', 'sp_h_l', 'sm_v_xl', 'sm_h_auto', {gap: css.$v.space_s})}>
          <Button label="Get Started" to="/docs/hello-world-example" />
          <Button to="https://github.com/trifrost-js/core" label="GitHub" blank={true} />
        </div>
        <Features />
        <Benchmark />
        <Cli />
        <Arcade />
        <div
          className={css.use('sm_t_giga', 'sm_h_auto', 'text_header_thin', {
            textAlign: 'center',
            position: 'relative',
            [css.before]: {
              content: '""',
              position: 'absolute',
              top: 'calc(50% - 10rem)',
              left: 'calc(50% - 30rem)',
              background: 'radial-gradient(' + css.$t.body_fg + ' 0%, transparent 70%)',
              display: 'inline-block',
              width: '60rem',
              height: '20rem',
              zIndex: -1,
              opacity: 0.05,
            },
          })}
        >
          <p className={css.use('sm_b_s')}>Ready for the frontier?</p>
          <GradientBorder style={css.mix('br_m')}>
            <div
              className={css.use('panel', 'sp_s', 'br_m', {
                border: '1px solid ' + css.$t.panel_border,
                fontSize: css.$v.font_s_small,
              })}
            >
              npm create <strong>trifrost@latest</strong>
            </div>
          </GradientBorder>
        </div>
      </Page>
    </Layout>,
  );
}

export async function rootRouter<State extends Record<string, unknown>>(r: Router<State>) {
  r.get('/', getHome)
    .get('/favicon.ico', ctx => ctx.file('./assets/favicon.ico'))
    .get('/r2assets/:key', async ctx => {
      const res = await ctx.env.TRIFROST_BUCKET.get(ctx.state.key);
      if (!res?.body) return ctx.status(404);

      const {body, size = null} = res;
      return ctx.file({stream: body, size, name: ctx.state.key});
    })
    .get('/sitemap.xml', async ctx => {
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        siteMapEntry('/'),
        ...(await ExamplesService.siteMap()),
        ...(await NewsService.siteMap(ctx)),
        ...(await DocsService.siteMap()),
      ];
      sitemap.push('</urlset>');

      ctx.setType(MimeTypes.XML);
      return ctx.text(sitemap.join('\n'));
    });
}

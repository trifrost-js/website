import {format} from '@valkyriestudios/utils/date';
import {ApiKeyAuth, Script} from '@trifrost/core';
import {type Router} from '../../types';
import {css} from '../../css';
import {Badge} from '../../components/atoms/Badge';
import {Time} from '../../components/atoms/Time';
import {Layout} from '../../components/layout/Layout';
import {ArrowRight, Filter} from '../../components/atoms/Icons';
import {Radio} from '../../components/atoms/Radio';
import {releaseRouter} from './releases/index';
import {blogRouter} from './blog/index';
import {Page} from '../../components/molecules/Page';
import {Panel} from '../../components/molecules/Panel';
import {NewsService, type NewsItem} from './Service';
import {ReleaseService} from './releases/Service';

function bucketKey(val: Date | string | number) {
  return format(new Date(val), 'YYYY-MM');
}

function buildMonthBuckets(items: NewsItem[]): Record<string, {count: number; label: string}> {
  const buckets: Record<string, {count: number; label: string}> = {};
  for (let i = 0; i < items.length; i++) {
    const el = items[i];
    const key = bucketKey(el.date);
    if (!buckets[key]) buckets[key] = {count: 0, label: format(new Date(el.date), 'MMM YYYY')};
    buckets[key].count += 1;
  }
  return buckets;
}

function NewsList({items}: {items: NewsItem[]}) {
  return (
    <div
      id="news-list"
      className={css.use('f', 'fv', {
        [css.media.desktop]: css.mix('fg', {width: '100%', gap: css.$v.space_l, maxWidth: 'calc(100% - 27rem)'}),
        [css.media.tablet]: {gap: css.$v.space_s, width: '100%'},
      })}
    >
      {items.map((el, idx) => (
        <Panel
          key={idx}
          style={css.mix('f', 'fh', 'fj_sb', {width: '100%', overflow: 'hidden'})}
          to={el.type === 'blog' ? `/news/blog/${el.slug}` : `/news/releases/${el.slug}`}
          alt={el.title}
        >
          <div
            className={css.use('f', 'fv', 'sp_r_l', {
              maxWidth: '100%',
              minWidth: 0,
              overflow: 'hidden',
              gap: css.$v.space_m,
              [css.media.mobile]: {gap: css.$v.space_s},
            })}
          >
            <h3 className={css.use('text_header')}>{el.title}</h3>
            {el.desc && (
              <p
                className={css.use('text_body', {
                  lineHeight: 1.4,
                  letterSpacing: '.1rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                })}
              >
                {el.desc}
              </p>
            )}
            <div className={css.use('f', 'fh', 'fa_c', 'fj_l', {gap: css.$v.space_s})}>
              <Badge type={el.type} style={{marginRight: css.$v.space_s}}>
                {el.type}
              </Badge>
              <Time date={el.date} style={css.mix('text_body_thin', {[css.media.tablet]: css.mix('hide')})} />
              <Time date={el.date} format="DD/MM/YYYY" style={css.mix('text_body_thin', {[css.media.desktop]: {display: 'none'}})} />
            </div>
          </div>
          <ArrowRight width={10} className={css.use('fs0')} />
        </Panel>
      ))}
    </div>
  );
}

function Sidebar({buckets}: {buckets: Record<string, {count: number; label: string}>}) {
  return (
    <form className={css.use('f', 'fv', 'fg', {gap: css.$v.space_xl})}>
      <fieldset className={css.use('f', 'fv')}>
        <legend
          className={css.use('text_form_label', {
            [css.media.desktop]: css.mix('sm_b_s'),
            [css.media.tablet]: css.mix('sm_b_m'),
          })}
        >
          Type
        </legend>
        <div className={css.use('f', 'fv', {gap: css.$v.space_xs})}>
          <Radio name="type" value="all" label="All" defaultChecked checked={true} />
          <Radio name="type" value="blog" label="Blog" checked={false} />
          <Radio name="type" value="release" label="Release" checked={false} />
        </div>
      </fieldset>
      <fieldset className={css.use('f', 'fv')}>
        <legend
          className={css.use('text_form_label', {
            [css.media.desktop]: css.mix('sm_b_s'),
            [css.media.tablet]: css.mix('sm_b_m'),
          })}
        >
          By Month
        </legend>
        <div className={css.use('f', 'fv', {gap: css.$v.space_xs})}>
          <Radio name="bucket" value="all" label="All" defaultChecked checked={true} />
          {Object.entries(buckets).map(([month, el]) => (
            <Radio key={month} name="bucket" value={month} label={`${el.label} (${el.count})`} checked={false} />
          ))}
        </div>
      </fieldset>
      <Script>
        {el => {
          async function load() {
            const res = await fetch('/news', {method: 'POST', body: new FormData(el as HTMLFormElement)});
            if (res.ok) document.querySelector('#news-list')!.outerHTML = await res.text();
          }

          el.querySelectorAll('input').forEach(input => input.addEventListener('change', load));
        }}
      </Script>
    </form>
  );
}

function SidebarWrapper({buckets}: {buckets: Record<string, {count: number; label: string}>}) {
  return (
    <div
      aria-expanded="false"
      className={css.use('fs0', {
        minWidth: '25rem',
        [css.media.desktop]: {
          position: 'sticky',
          top: css.$v.space_l,
        },
        [css.media.tablet]: {
          [`${css.attr('aria-expanded', false)} > div`]: css.mix('hide'),
          [`${css.attr('aria-expanded', true)} > div`]: css.mix('f', 'fj_l', {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: css.$v.space_l,
            paddingBottom: `calc(${css.$v.space_l} + env(safe-area-inset-bottom))`,
            background: css.$t.body_bg,
            minHeight: '100%',
            zIndex: 100,
            overflowY: 'scroll',
          }),
        },
      })}
    >
      <button
        type="button"
        className={css.use('button', 'button_t_blue', 'button_s', 'f', 'fa_c', 'fj_c', {
          gap: css.$v.space_xs,
          margin: '0 auto',
          [css.media.desktop]: css.mix('hide'),
        })}
      >
        <Filter width={14} /> Filter
        <Script>
          {el => {
            el.addEventListener('click', () => el.parentElement!.setAttribute('aria-expanded', 'true'));
          }}
        </Script>
      </button>
      <div
        className={css.use('f', 'fv', {
          [css.media.desktop]: css.mix('panel', 'br_m', 'sp_l', {border: '1px solid ' + css.$t.panel_border}),
          [css.media.tablet]: {height: '100%'},
        })}
      >
        <h1
          className={css.use('text_header', {
            [css.media.desktop]: css.mix('sm_b_l'),
            [css.media.tablet]: css.mix('sm_b_xl'),
          })}
        >
          Filters
        </h1>
        <Sidebar buckets={buckets} />
        <button
          type="button"
          className={css.use('button', 'button_t_blue', 'button_s', {
            [css.media.desktop]: css.mix('hide'),
          })}
        >
          Close
          <Script>
            {el => {
              el.addEventListener('click', () => el.parentElement!.parentElement!.setAttribute('aria-expanded', 'false'));
            }}
          </Script>
        </button>
      </div>
    </div>
  );
}

export async function newsRouter<State extends Record<string, unknown>>(r: Router<State>) {
  r.get('', async ctx => {
    const list = await NewsService.list(ctx);
    const buckets = buildMonthBuckets(list);

    return ctx.html(
      <Layout title="TriFrost News" description="A running log of what’s new in TriFrost" section="news">
        <Page width={'130rem'}>
          <div
            className={css.use('f', 'fv', 'fa_c', 'sm_h_s', {
              textAlign: 'center',
              [css.media.desktop]: css.mix('sm_b_l', 'sp_v_xl'),
              [css.media.tablet]: css.mix('sp_v_xl'),
            })}
          >
            <h1 className={css.use('text_page_title', 'sm_b_m')}>TriFrost News</h1>
            <p className={css.use('text_header_thin', {lineHeight: 1.4, maxWidth: '65rem'})}>
              A running log of what’s new in TriFrost — from releases to behind-the-scenes thoughts
            </p>
          </div>
          <div
            className={css.use('f', 'fj_sb', {
              width: '100%',
              gap: css.$v.space_l,
              [css.media.desktop]: css.mix('fa_l', 'fg'),
              [css.media.tablet]: css.mix('fv'),
            })}
          >
            <SidebarWrapper buckets={buckets} />
            <NewsList items={list} />
          </div>
        </Page>
      </Layout>,
    );
  })
    .post('', async ctx => {
      const all = await NewsService.list(ctx);
      const {type, bucket} = ctx.body as {type?: string; bucket?: string};

      const n_type = type === 'all' || !type ? null : type;
      const n_bucket = bucket === 'all' || !bucket ? null : bucket;

      const list: NewsItem[] = [];
      for (let i = 0; i < all.length; i++) {
        const el = all[i];
        if ((n_type === null || el.type === n_type) && (n_bucket === null || n_bucket === bucketKey(el.date))) list.push(el);
      }

      return ctx.html(<NewsList items={list} />);
    })
    .group('/releases', releaseRouter)
    .group('/blog', blogRouter)
    /**
     * Cache purge endpoint:
     * - Guarded by api key auth
     * - run with noSync = true to not sync from github
     * - purges news cache
     */
    .route('/cache_purge', route => {
      route
        .use(
          ApiKeyAuth({
            apiKey: {header: 'x-trifrost-auth'},
            validate: (ctx, {apiKey}) => apiKey === ctx.env.TRIFROST_API_TOKEN,
          }),
        )
        .post(async ctx => {
          const noSync = ctx.query.get('noSync') ?? false;
          if (!noSync) await ReleaseService.syncToDb(ctx);
          await NewsService.evict(ctx);
          return ctx.status(200);
        });
    });
}

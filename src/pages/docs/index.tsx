import {ApiKeyAuth} from '@trifrost/core';
import {Layout} from '../../components/layout/Layout';
import {type Router} from '../../types';
import {DocsService, type Doc} from './Service';
import {Markdown} from '../../utils/Markdown';
import {ShareThis} from '../../components/molecules/ShareThis';
import {Article} from '../../components/molecules/Article';
import {css} from '../../css';
import {Script} from '../../script';
import {Collapsible} from '../../components/atoms/Collapsible';
import {Page} from '../../components/molecules/Page';
import {NextPrevious} from '../../components/molecules/NextPrevious';
import {MarkdownLinks} from '../../components/molecules/MarkdownLinks';
import {Menu, TableOfContents} from '../../components/atoms/Icons';

type DocsEvents = {
  'docsmenu:mobile:open': void;
};

declare global {
  interface AtomicRelay extends DocsEvents {}
}

export function DocsSidebar({entry}: {entry: Doc}) {
  const collapseCid = css.cid();
  const mainCls = css.use('f', 'fv', 'fs0', {
    alignSelf: 'flex-start',
    h2: css.mix('text_form_label'),
    [`> *${css.lastChild}`]: {borderBottom: 'none'},
    [css.media.desktop]: css.mix('panel', 'br_m', 'sp_h_l', {
      border: '1px solid ' + css.$t.panel_border,
      position: 'sticky',
      top: css.$v.space_l,
      width: '30rem',
    }),
    [css.media.tablet]: {
      [css.attr('aria-expanded', false)]: css.mix('hide'),
      [css.attr('aria-expanded', true)]: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        minHeight: '100%',
        padding: css.$v.space_l,
        paddingBottom: `calc(${css.$v.space_l} + env(safe-area-inset-bottom))`,
        background: css.$t.body_bg,
        zIndex: 100,
        overflowY: 'scroll',
      },
    },
  });

  const entryCls = css.use('f', 'sp_h_s', 'text_body', 'br_m', {
    cursor: 'pointer',
    userSelect: 'none',
    border: 'none',
    overflow: 'hidden',
    color: css.$t.body_fg,
    textDecoration: 'none',
    fontSize: css.$v.font_s_small,
    letterSpacing: '.1rem',
    [css.attr('aria-current')]: {
      backgroundColor: css.$t.badge_bg,
      color: css.$t.badge_fg,
      fontWeight: 600,
    },
    [css.not(css.attr('aria-current'))]: css.mix('outline'),
    [css.media.desktop]: css.mix('sp_v_xs', {
      lineHeight: 1.4,
    }),
    [css.media.tablet]: css.mix('fa_c', {
      height: '4rem',
    }),
  });
  return (
    <aside id="docs-menu" aria-expanded="false" className={mainCls}>
      {DocsService.list().map(section => (
        <Collapsible
          title={section.title}
          group={collapseCid}
          defaultExpanded={!!section.items.find(el => el.slug === entry.slug)}
          data-sidebar
          data-sidebar-group={section.slug}
        >
          <ul>
            {section.items.map(item => (
              <li key={item.slug}>
                <a
                  href={`/docs/${item.slug}`}
                  className={entryCls}
                  data-sidebar-entry
                  data-sidebar-slug={item.slug}
                  {...(item.slug === entry.slug && {'aria-current': true})}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible>
      ))}
      <div className={css.use('fg', {[css.media.desktop]: css.mix('hide')})}></div>
      <button
        type="button"
        className={css.use('button', 'button_t_blue', 'button_s', {
          [css.media.desktop]: css.mix('hide'),
        })}
      >
        Close
        <Script>{({el, $}) => $.on(el, 'click', () => $.fire(el, 'docsmenu:mobile:close'))}</Script>
      </button>
      <Script>
        {({el, $}) => {
          el.$subscribe('docsmenu:mobile:open', () => el.setAttribute('aria-expanded', 'true'));
          $.on(el, 'docsmenu:mobile:close', () => el.setAttribute('aria-expanded', 'false'));
        }}
      </Script>
    </aside>
  );
}

export function OnThisPage({contentId, id}: {contentId: string; id: string}) {
  return (
    <nav
      aria-label="Table of contents for article"
      className={css.use('f', 'fv', 'fs0', 'sp_v_l', 'panel', 'br_m', 'sp_h_l', {
        border: '1px solid ' + css.$t.panel_border,
        width: '30rem',
        alignSelf: 'flex-start',
        gap: css.$v.space_l,
        h2: css.mix('text_form_label'),
        [css.media.desktop]: {
          position: 'sticky',
          top: css.$v.space_l,
        },
        [css.media.tablet]: {
          position: 'absolute',
          [css.not(css.attr('aria-expanded'))]: css.mix('hide'),
          [css.attr('aria-expanded', false)]: css.mix('hide'),
        },
      })}
      id={id}
    >
      <h2>On this page</h2>
      <MarkdownLinks id={contentId} />
      <Script>
        {({el, $}) => {
          $.queryAll(el, 'a').forEach(link => {
            $.on(link, 'click', () => el.setAttribute('aria-expanded', 'false'));
          });
        }}
      </Script>
    </nav>
  );
}

export async function docsRouter<State extends Record<string, unknown>>(r: Router<State>) {
  r.get('', ctx => ctx.redirect(DocsService.root().to))
    .get('/:slugId', async ctx => {
      /* If slug does not exist, redirect to docs root */
      const entry = await DocsService.one(ctx);
      if (!entry) return ctx.redirect(DocsService.root().to);

      /* Get doc */
      const doc = await DocsService.load(ctx);
      if (!doc) return ctx.setStatus(404);

      const tableOfContentsId = css.cid();
      const contentId = css.cid();

      return ctx.html(
        <Layout section="docs" title={entry.title} description={entry.desc}>
          <Page width={'150rem'}>
            <div
              className={css.use('f', 'fv', 'fa_c', 'sm_h_s', {
                textAlign: 'center',
                [css.media.desktop]: css.mix('sm_b_l', 'sp_v_xl'),
                [css.media.tablet]: css.mix('sp_v_xl'),
              })}
            >
              <h1 className={css.use('text_page_title', 'sm_b_m')}>TriFrost Docs</h1>
              <p className={css.use('text_header_thin', {lineHeight: 1.4, maxWidth: '65rem'})}>
                Learn and build with confidence, from a first project with workers to global scale on bare metal.
              </p>
            </div>
            <div className={css.use('f', 'fh', 'fg', 'fj_c', {width: '100%'})}>
              <DocsSidebar entry={entry} />
              <div
                className={css.use('f', 'fh', 'fg', {
                  [css.media.tablet]: {width: '100%'},
                })}
              >
                <div
                  className={css.use('fg', {
                    [css.media.desktop]: {maxWidth: 'calc(150rem - 50rem)'},
                    [css.media.tablet]: {width: '100%'},
                  })}
                >
                  <Article
                    style={css.mix('fs0', {
                      [css.media.desktop]: css.mix('sm_h_l', 'fg'),
                      [css.media.tablet]: {width: '100%'},
                    })}
                  >
                    <div
                      className={css.use('f', 'fh', 'fa_c', {
                        gap: css.$v.space_s,
                        [css.media.desktop]: css.mix('sm_b_xl'),
                        [css.media.tablet]: css.mix('sm_b_m'),
                      })}
                    >
                      <button
                        type="button"
                        className={css.use('f', 'fa_c', 'button', 'button_s', 'button_t_grey', {
                          height: '4rem',
                          [css.media.desktop]: css.mix('hide'),
                        })}
                      >
                        <Menu width={20} />
                        <Script>{({el, $}) => $.on(el, 'click', () => el.$publish('docsmenu:mobile:open'))}</Script>
                      </button>
                      <h2
                        className={css.use('fg', {
                          fontFamily: css.$v.font_header,
                          lineHeight: 1.2,
                          fontWeight: '100 !important',
                          marginTop: '0 !important',
                          marginBottom: '0 !important',
                        })}
                      >
                        {entry.title}
                      </h2>
                      <button
                        type="button"
                        className={css.use('f', 'fa_c', 'button', 'button_s', 'button_t_grey', {
                          height: '4rem',
                          [css.media.desktop]: css.mix('hide'),
                        })}
                      >
                        <TableOfContents width={20} />
                        <Script data={{tableOfContentsId}}>
                          {({el, data, $}) => {
                            function absoluteOffset(el: HTMLElement) {
                              const offset = {x: 0, y: 0};
                              let cursor = el;
                              while (cursor) {
                                offset.x += cursor.offsetLeft - cursor.scrollLeft + cursor.clientLeft;
                                offset.y += cursor.offsetTop - cursor.scrollTop + cursor.clientTop;
                                cursor = cursor.offsetParent as HTMLElement;
                              }
                              return offset;
                            }
                            $.on(el, 'click', () => {
                              const nav = document.getElementById(data.tableOfContentsId)!;
                              nav.setAttribute('aria-expanded', String(nav.getAttribute('aria-expanded')) === 'true' ? 'false' : 'true');
                              const bounds = el.getBoundingClientRect();
                              const offset = absoluteOffset(el);
                              nav.style.top = `${Math.floor(offset.y) - bounds.height + 5}px`;
                              nav.style.right = `${document.documentElement.clientWidth - offset.x - bounds.width - 5}px`;
                            });
                          }}
                        </Script>
                      </button>
                    </div>
                    <div id={contentId}>{Markdown.renderTree(doc.tree)}</div>
                    <NextPrevious next={entry.next} previous={entry.previous} reversed={true} />
                  </Article>
                  <ShareThis url={ctx.path} title={entry.title} />
                </div>
                <OnThisPage contentId={contentId} id={tableOfContentsId} />
              </div>
            </div>
          </Page>
        </Layout>,
      );
    })
    .route('/cache_purge', route =>
      route
        .use(
          ApiKeyAuth({
            apiKey: {header: 'x-trifrost-auth'},
            validate: (ctx, {apiKey}) => apiKey === ctx.env.TRIFROST_API_TOKEN,
          }),
        )
        .post(async ctx => {
          await DocsService.evict(ctx);
          return ctx.status(200);
        }),
    );
}

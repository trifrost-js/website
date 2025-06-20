import {ApiKeyAuth, Style} from '@trifrost/core';
import {Layout} from '../../components/layout/Layout';
import {type Router} from '../../types';
import {DocsService, type Doc} from './Service';
import {Markdown, type MarkdownNode} from '../../utils/Markdown';
import {ShareThis} from '../../components/molecules/ShareThis';
import {Article} from '../../components/molecules/Article';
import {css} from '../../css';
import {Script} from '../../script';
import {Collapsible} from '../../components/atoms/Collapsible';
import {Page} from '../../components/molecules/Page';
import {NextPrevious} from '../../components/molecules/NextPrevious';

export type DocsEvents = {
  'docsmenu:mobile:open': void;
  'docsmenu:mobile:close': void;
};

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
        position: 'absolute',
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
        <Script>{el => el.$publish('docsmenu:mobile:close')}</Script>
      </button>
      <Script>
        {el => {
          el.$subscribe('docsmenu:mobile:open', () => el.setAttribute('aria-expanded', 'true'));
          el.$subscribe('docsmenu:mobile:close', () => el.setAttribute('aria-expanded', 'false'));
        }}
      </Script>
    </aside>
  );
}

export function DocsOnThisPage({tree}: {tree: MarkdownNode[]}) {
  const cls = css.use('f', 'fv', 'fs0', 'sp_v_l', {
    maxWidth: '30rem',
    width: '30rem',
    alignSelf: 'flex-start',
    h2: css.mix('text_form_label'),
    div: css.mix('f', 'fv', 'sm_t_l'),
    a: css.mix('text_body', 'sp_xs', {
      cursor: 'pointer',
      userSelect: 'none',
      border: 'none',
      overflow: 'hidden',
      color: css.$t.body_fg,
      fontSize: css.$v.font_s_small,
      letterSpacing: '.1rem',
      lineHeight: 1.4,
      textDecoration: 'none',
      marginLeft: 0,
      [css.attr('data-level', '5')]: {
        marginLeft: css.$v.space_m,
      },
      [css.hover]: {
        textDecoration: 'underline',
      },
      [css.not(css.lastChild)]: {
        borderBottom: '1px solid ' + css.$t.panel_border,
      },
    }),
    [css.media.desktop]: css.mix('panel', 'br_m', 'sp_h_l', {
      border: '1px solid ' + css.$t.panel_border,
      position: 'sticky',
      top: css.$v.space_l,
    }),
    [css.media.tablet]: css.mix('hide'),
  });

  return (
    <nav aria-label="Table of contents for article" className={cls}>
      <h2>On this page</h2>
      <div>
        {Markdown.extractHeadersFromNodes(tree).map(el => (
          <a href={`#${el.id}`} key={el.id} data-level={el.level}>
            {el.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function DocsMenuMobile({tree}: {tree: MarkdownNode[]}) {
  return (
    <nav
      aria-label="Table of contents for article"
      aria-expanded="false"
      className={css.use('f', 'fv', {
        [css.media.desktop]: css.mix('hide', 'sm_v_l'),
        [css.media.tablet]: css.mix('sm_b_m', {
          [css.attr('aria-expanded', false)]: {
            [` div${css.lastOfType}`]: css.mix('hide'),
          },
        }),
      })}
    >
      <div className={css.use('f', 'sm_t_s', 'sm_b_l', {gap: css.$v.space_s})}>
        <button
          type="button"
          className={css.use('f', 'fh', 'fa_c', 'fj_c', 'button', 'button_s', 'button_t_blue', {
            justifySelf: 'center',
            alignSelf: 'flex-start',
            gap: css.$v.space_s,
            [css.media.desktop]: css.mix('hide'),
          })}
        >
          ≣ Docs
          <Script>{el => el.addEventListener('click', () => el.$publish('docsmenu:mobile:open'))}</Script>
        </button>
        <button
          type="button"
          className={css.use('f', 'fh', 'fa_c', 'fj_c', 'button', 'button_s', 'button_t_blue', {
            justifySelf: 'center',
            alignSelf: 'flex-start',
            gap: css.$v.space_s,
            [css.media.desktop]: css.mix('hide'),
          })}
        >
          ≣ Table of contents
          <Script>
            {el => {
              el.addEventListener('click', () => {
                const nav = el.closest('nav')!;
                const isOpen = nav.getAttribute('aria-expanded') + '' === 'true';
                nav.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
              });
            }}
          </Script>
        </button>
      </div>
      <div className={css.use('f', 'fv', 'panel_alt', 'sm_b_l', 'sp_s', 'br_m')}>
        {Markdown.extractHeadersFromNodes(tree).map(el => (
          <a
            href={`#${el.id}`}
            key={el.id}
            className={css.use('text_body', 'sp_xs', {
              cursor: 'pointer',
              userSelect: 'none',
              border: 'none',
              overflow: 'hidden',
              color: css.$t.body_fg,
              fontSize: css.$v.font_s_small,
              letterSpacing: '.1rem',
              lineHeight: 1.4,
              textDecoration: 'none',
              marginLeft: el.level > 3 ? css.$v.space_m : 0,
              [css.hover]: {
                textDecoration: 'underline',
              },
              [css.not(css.lastChild)]: {
                borderBottom: '1px solid ' + css.$t.panel_border,
              },
            })}
          >
            {el.title}
          </a>
        ))}
      </div>
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
                    <h2
                      className={css.use({
                        fontFamily: css.$v.font_header,
                        lineHeight: 1.2,
                        fontWeight: '100 !important',
                        [css.media.desktop]: {
                          marginBottom: `${css.$v.space_xl} !important`,
                        },
                        [css.media.tablet]: {
                          marginBottom: `${css.$v.space_m} !important`,
                        },
                      })}
                    >
                      {entry.title}
                    </h2>
                    <DocsMenuMobile tree={doc.tree} />
                    {Markdown.renderTree(doc.tree)}
                    <NextPrevious next={entry.next} previous={entry.previous} reversed={true} />
                  </Article>
                  <ShareThis url={ctx.path} title={entry.title} />
                </div>
                <DocsOnThisPage tree={doc.tree} />
                <Style />
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

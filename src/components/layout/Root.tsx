import {isNeString} from '@valkyriestudios/utils/string';
import {css} from '../../css';
import {ThemeSetter} from '../atoms/Theme';

type RootProps = {
  children: any;
  title?: string;
  description?: string | null;
};

export function Root({children, title, description}: RootProps) {
  css.root({
    [`*${css.selection}`]: {
      backgroundColor: css.$t.selection_bg,
      color: css.$t.selection_fg,
    },
    strong: {fontWeight: 600},
    'pre code.hljs': {
      backgroundColor: css.$t.code_bg,
      color: css.$t.code_fg,
      display: 'block',
      overflowX: 'auto',
      padding: css.$v.space_s,
      borderRadius: css.$v.rad_m,
      letterSpacing: '.1rem',
      lineHeight: 1.4,
      fontFamily: css.$v.font_header,
    },
    [` *${css.is('p code, ul li code, code.hljs')}`]: {
      backgroundColor: css.$t.code_single_bg,
      color: css.$t.code_single_fg,
      padding: '0.1rem 0.2rem',
      borderRadius: css.$v.rad_s,
      letterSpacing: '.1rem',
      fontFamily: css.$v.font_body,
    },
    [[
      '.hljs-doctag',
      '.hljs-keyword',
      '.hljs-meta .hljs-keyword',
      '.hljs-template-tag',
      '.hljs-template-variable',
      '.hljs-type',
      '.hljs-variable.language_',
    ].join(',')]: {color: '#ff7b72'},
    [['.hljs-title', '.hljs-title.class_', '.hljs-title.class_.inherited__', '.hljs-title.function_'].join(',')]: {color: '#d2a8ff'},
    [[
      '.hljs-attr',
      '.hljs-attribute',
      '.hljs-literal',
      '.hljs-meta',
      '.hljs-number',
      '.hljs-operator',
      '.hljs-selector-attr',
      '.hljs-selector-class',
      '.hljs-selector-id',
      '.hljs-variable',
    ].join(',')]: {color: '#79c0ff'},
    [['.hljs-meta .hljs-string', '.hljs-regexp', '.hljs-string'].join(',')]: {color: '#a5d6ff'},
    [['.hljs-built_in', '.hljs-symbol'].join(',')]: {color: '#ffa657'},
    [['.hljs-code', '.hljs-comment', '.hljs-formula'].join(',')]: {color: '#8b949e'},
    [['.hljs-name', '.hljs-quote', '.hljs-selector-pseudo', '.hljs-selector-tag'].join(',')]: {color: '#7ee787'},
    '.hljs-subst': {color: '#c9d1d9'},
    '.hljs-section': {color: '#1f6feb', fontWeight: 700},
    '.hljs-bullet': {color: '#f2cc60'},
    '.hljs-emphasis': {color: '#c9d1d9', fontStyle: 'italic'},
    '.hljs-strong': {color: '#c9d1d9', fontWeight: 700},
    '.hljs-addition': {color: '#aff5b4', backgroundColor: '#033a16'},
    '.hljs-deletion': {color: '#ffdcd7', backgroundColor: '#67060c'},
  });

  const n_title = isNeString(title) ? title : 'TriFrost';
  const n_desc = isNeString(description) ? description : 'Blazing-fast, runtime-agnostic server framework for modern JavaScript runtimes';
  const pageTitle = n_title === 'TriFrost' ? 'TriFrost' : `TriFrost | ${n_title.replace(/^TriFrost /, '')}`;

  return (
    <html
      lang="en"
      className={css.use({
        width: '100%',
        height: '100%',
        fontSize: '62.5%',
        background: css.$t.body_bg,
        color: css.$t.body_fg,
      })}
    >
      <head>
        <title>{pageTitle}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={n_desc} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={n_title} />
        <meta property="og:description" content={n_desc} />
        <meta property="og:image" content="https://www.trifrost.dev/assets/og-facebook.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TriFrost" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="https://www.trifrost.dev/assets/og-twitter.jpg" />
        <meta name="twitter:title" content={n_title} />
        <meta name="twitter:description" content={n_desc} />

        {/* Icons and Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital@0;1&display=swap" rel="stylesheet"></link>
        <link rel="icon" type="image/png" href="/assets/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
        <link rel="shortcut icon" href="/assets/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* TriFrost theme switcher */}
        <ThemeSetter />
      </head>
      <body
        className={css.use('f', 'fv', 'fa_c', 'fj_sb', {
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          lineHeight: 1,
          fontSize: '1.6rem',
          fontWeight: 400,
          position: 'relative',
          fontFamily: css.$v.font_body,
        })}
      >
        {children}
      </body>
    </html>
  );
}

import {css} from '../../css';

type ArticleProps = {
  children: any;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Article({children, style, ...rest}: ArticleProps) {
  const cls = css.use('sp_l', 'br_m', 'panel', {
    wordWrap: 'break-word',
    maxWidth: '100%',
    textAlign: 'left',
    border: '1px solid ' + css.$t.panel_border,
    h1: css.mix('text_page_title', 'sm_t_xl', 'sm_b_l'),
    h2: css.mix('sm_t_xl', 'sm_b_l', {
      fontSize: `calc(${css.$v.font_s_header} + 0.8rem)`,
      fontFamily: css.$v.font_header,
      fontWeight: 600,
      lineHeight: 1.2,
      [css.media.mobile]: {
        fontSize: `calc(${css.$v.font_s_header} + 0.5rem)`,
      },
    }),
    [` *${css.is('h3, h4')}`]: css.mix('sm_t_xl', 'sm_b_l', {
      fontSize: css.$v.font_s_header,
      fontFamily: css.$v.font_header,
      fontWeight: 600,
      lineHeight: 1.2,
      [css.media.mobile]: {
        fontSize: `calc(${css.$v.font_s_header} - 0.2rem)`,
      },
    }),
    [` *${css.is('h5, h6')}`]: css.mix('sm_t_xl', 'sm_b_l', 'sp_b_xs', {
      fontSize: css.$v.font_s_header,
      fontFamily: css.$v.font_header,
      fontWeight: 100,
      lineHeight: 1.2,
      borderBottom: '1px solid ' + css.$t.panel_border,
      [css.media.mobile]: {
        fontSize: `calc(${css.$v.font_s_header} - 0.2rem)`,
      },
    }),
    p: css.mix('text_body', {
      lineHeight: 1.4,
      letterSpacing: '.1rem',
      [`+ *${css.is('ul', 'ol', '.highlight')}`]: css.mix('sm_t_xs'),
      [`+ *${css.is('hr')}`]: css.mix('sm_t_xl'),
      [`+ *${css.not(css.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'ul', 'ol', '.highlight'))}`]: css.mix('sm_t_l'),
    }),
    [` ${css.is('ul', 'ol')}`]: css.mix('sm_l_m', 'sp_l_s', {
      listStyleType: 'disc',
      letterSpacing: '.1rem',
      li: css.mix('sm_t_s', {
        lineHeight: 1.4,
        fontSize: css.$v.font_s_body,
        [css.media.mobile]: {
          fontSize: `calc(${css.$v.font_s_body} - 0.2rem)`,
        },
      }),
    }),
    [` ${css.is('pre', 'img', '.highlight', 'ul', 'ol')}`]: {
      [`+ *${css.not(css.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'ul', 'ol', '.highlight'))}`]: css.mix('sm_t_l'),
      [`+ *${css.is('.highlight')}`]: css.mix('sm_t_s'),
    },
    [` a${css.not('.back')}`]: {
      color: css.$t.body_fg,
      textDecoration: 'underline',
    },
    ' .back': css.mix('sm_b_l', {
      [`+ *${css.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6')}`]: css.mix('sm_t_s'),
    }),
    hr: {
      border: 'none',
      [`+ *${css.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6')}`]: {
        marginTop: css.$v.space_xl,
      },
      [css.not('.separator')]: css.mix('sm_v_xl', {
        borderTop: '4px solid ' + css.$t.panel_border,
        borderRadius: css.$v.rad_s,
      }),
      '.separator': css.mix('sm_v_l', {
        borderTop: '1px dashed ' + css.$t.panel_border,
      }),
    },
    img: css.mix('br_m', {
      maxWidth: '100%',
      display: 'block',
    }),
    blockquote: css.mix('text_body', 'sp_l_m', {
      lineHeight: 1.4,
      letterSpacing: '.1rem',
      borderLeft: '4px solid ' + css.$t.body_fg,
      [`+ *${css.is('hr', 'p')}`]: css.mix('sm_t_xl'),
      [`+ *${css.not(css.is('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'hr', 'blockquote'))}`]: css.mix('sm_t_l'),
    }),
    '>': {
      ' .runtime': css.mix('sm_b_l'),
      ' .highlight': css.mix('sm_b_s'),
      [` *${css.firstChild}`]: {marginTop: 0},
      [` *${css.lastChild}`]: {marginBottom: 0},
    },
    ...(style || {}),
  });

  if (typeof children === 'string') {
    return <main className={cls} dangerouslySetInnerHTML={{__html: children}} {...rest}></main>;
  } else {
    return (
      <main className={cls} {...rest}>
        {children}
      </main>
    );
  }
}

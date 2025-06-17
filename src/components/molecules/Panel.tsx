import {css} from '../../css';

type PanelProps = {
  children: any;
  to?: string;
  alt?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Panel({children, to, alt, style, ...rest}: PanelProps) {
  const baseStyle = css.mix(
    'br_m',
    {
      maxWidth: '100%',
      backgroundColor: css.$t.panel_bg,
      color: css.$t.panel_fg,
      textAlign: 'left',
      border: '1px solid ' + css.$t.panel_border,
      [css.media.desktop]: css.mix('sp_l'),
      [css.media.tablet]: css.mix('sp_m'),
    },
    style || {},
  );

  if (typeof to === 'string') {
    return (
      <a
        href={to}
        target="_self"
        rel="follow"
        className={css.use({textDecoration: 'none'}, 'outline', baseStyle)}
        {...(typeof alt === 'string' && {'aria-label': alt})}
        {...rest}
      >
        {children}
      </a>
    );
  } else {
    return (
      <article className={css.use(baseStyle)} {...rest}>
        {children}
      </article>
    );
  }
}

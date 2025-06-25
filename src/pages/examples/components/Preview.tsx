import {css} from '../../../css';
import {type Logo} from '../Service';
import {HTMX, NodeJS, TriFrost} from '../../../components/atoms/Icons';

const LOGO_REGISTRY: {[K in Logo]: () => JSX.Element} = {
  trifrost: () => <TriFrost />,
  htmx: () => <HTMX />,
  nodejs: () => <NodeJS />,
};

type PreviewHeaderOptions = {
  logo1: Logo;
  logo2: Logo;
  type: 'large' | 'small';
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function PreviewHeader({logo1, logo2, type, style, ...rest}: PreviewHeaderOptions) {
  const cls = css.use(
    'br_m',
    'f',
    'fh',
    'fa_c',
    {
      width: '100%',
      overflow: 'hidden',
      background: css.$t.body_bg,
      color: css.$t.body_fg,
      svg: {
        width: '100%',
        height: 'auto',
        maxHeight: type === 'small' ? '8rem' : '12rem',
        maxWidth: type === 'small' ? '16rem' : '25rem',
      },
      span: css.mix('sp_h_xl', {
        fontSize: css.$v.font_s_title,
        fontWeight: 600,
        userSelect: 'none',
        [css.media.tablet]: css.mix('hide'),
      }),
      [css.media.desktop]: css.mix('sp_xl', 'fj_c'),
      [css.media.tablet]: css.mix('sp_l', 'fj_sa'),
    },
    style || {},
  );

  return (
    <div className={cls} {...rest}>
      {LOGO_REGISTRY[logo1]()}
      <span>+</span>
      {LOGO_REGISTRY[logo2]()}
    </div>
  );
}

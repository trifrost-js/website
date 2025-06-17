import {css} from '../../css';

type BadgeProps = {
  type?: 'release' | 'blog' | 'normal';
  style?: Record<string, unknown>;
  children: any;
  [key: string]: unknown;
};

export function Badge({type, style, children, ...rest}: BadgeProps) {
  const cls = css.use('sp_xs', 'br_s', `badge_${type || 'normal'}`, {
    fontWeight: 400,
    letterSpacing: '.1rem',
    fontSize: css.$v.font_s_small,
    ...(style || {}),
    [css.media.mobile]: {
      fontSize: `calc(${css.$v.font_s_small} - 0.2rem)`,
    },
  });

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}

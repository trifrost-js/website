import {css} from '../../css';

type SeparatorProps = {
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Separator({style, ...rest}: SeparatorProps) {
  const cls = css.use('sm_h_s', {
    fontSize: css.var.font_s_header,
    fontWeight: 600,
    ...(style || {}),
  });

  return (
    <span className={cls} {...rest}>
      |
    </span>
  );
}

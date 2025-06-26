import {css} from '../../css';

type LinkOptions = {
  to: string;
  style?: Record<string, unknown>;
  children: any;
  [key: string]: unknown;
};

export function Link({to, children, style, ...rest}: LinkOptions) {
  const cls = css.use({color: css.$t.body_fg}, style || {});
  const target = to.startsWith('http') && to.indexOf('trifrost.dev') < 0 ? '_blank' : '_self';

  return (
    <a href={to} target={target} className={cls} {...rest}>
      {children}
    </a>
  );
}

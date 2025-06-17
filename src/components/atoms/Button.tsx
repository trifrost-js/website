import {css} from '../../css';

type ButtonProps = {
	to: string;
	label: string;
	size?: 's' | 'l';
	style?: Record<string, unknown>;
	blank?: boolean;
	[key:string]:unknown;
};

export function Button({to, label, size, style, blank, ...rest}:ButtonProps) {
  const cls = css.use('button', 'button_t_blue', size === 's' ? 'button_s' : 'button_l', style || {});

  return (
    <a className={cls} href={to} target={blank ? '_blank' : '_self'} {...rest}>
      {label}
    </a>
  );
}

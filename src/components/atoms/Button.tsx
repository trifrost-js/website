import {css} from '../../css';

export function Button (props:{
	to:string,
	label:string,
	size?: "s" | "l",
	style?: Record<string, unknown>,
	blank?: boolean;
}) {
	const cls = css.use(
		'button',
		'button_t_blue',
		props.size === 's' ? 'button_s' : 'button_l',
		props.style || {},
	);

	return (<a className={cls} href={props.to} target={props.blank ? '_blank' : '_self'}>{props.label}</a>);
}

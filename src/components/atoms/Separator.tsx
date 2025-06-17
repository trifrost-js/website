import {css} from "../../css";

export function Separator (props:{style?:Record<string, unknown>}) {
	const cls = css.use('sm_h_s', {
		fontSize: css.var.font_s_header,
		fontWeight: 600,
		...props.style || {}
	});

	return (<span className={cls}>|</span>);
}

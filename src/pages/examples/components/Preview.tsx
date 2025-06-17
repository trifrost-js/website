import {css} from '../../../css';

export function PreviewHeader (props:{logo1: JSX.Element, logo2?: JSX.Element}) {
	const cls = css({
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		overflow: 'hidden',
		background: css.$t.body_bg,
		color: css.$t.body_fg,
		borderRadius: css.$v.rad_m,
		[css.media.desktop]: {
			padding: css.$v.space_xl,
			justifyContent: 'center',
			' > span': {
				fontSize: css.$v.font_s_title,
				paddingLeft: css.$v.space_xl,
				paddingRight: css.$v.space_xl
			},
		},
		[css.media.tablet]: {
			padding: css.$v.space_l,
			justifyContent: 'space-around',
			' > span': {
				display: 'none',
			},
		},
	});

	return (<div className={cls}>
		{props.logo1}
		{props.logo2 && (<><span>+</span>{props.logo2}</>)}
	</div>);
}

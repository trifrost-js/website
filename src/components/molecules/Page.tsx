import {css} from '../../css';

type PageProps = {
	width?:string;
	style?:Record<string, unknown>;
	children:any;
	[key:string]: unknown;
};

export function Page ({width, style, children, ...rest}:PageProps) {
	const clsWrapper = css.use('f', 'fv', 'fg', 'fa_c', {
		[css.media.desktop]: css.mix('sp_h_m', 'sm_v_xl'),
		[css.media.tablet]: css.mix('sm_b_xl'),
	}, style || {});

	const cls = css.use('f', 'fv', 'fa_c', {
		width: '100%',
		[css.media.desktop]: {maxWidth: width || '105rem'},
	});

	return (<div className={clsWrapper} {...rest}>
		<div className={cls}>
			{children}
		</div>
	</div>)
}

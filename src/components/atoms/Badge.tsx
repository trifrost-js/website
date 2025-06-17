import {css} from '../../css';

export function Badge (props:{
	type?: 'release' | 'blog' | 'normal',
	style?: Record<string, unknown>,
	children: any,
}) {
    const cls = css.use(
        'sp_xs',
        'br_s',
        `badge_${props.type || 'normal'}`,
        {
            fontWeight: 400,
            letterSpacing: '.1rem',
            fontSize: css.$v.font_s_small,
            ...props.style || {},
            [css.media.mobile]: {
                fontSize: `calc(${css.$v.font_s_small} - 0.2rem)`,
            },
        }
    );

    return <span className={cls}>{props.children}</span>;
}

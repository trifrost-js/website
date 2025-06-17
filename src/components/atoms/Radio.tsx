import {css} from '../../css';

export function Radio ({
    name,
    value,
    label,
    defaultChecked,
    checked,
    ...props
}: {
    name: string;
    value: string;
    label: string;
    defaultChecked?: boolean;
	checked: boolean;
    [key: string]: unknown;
}) {
    const base = css.use('f', 'fj_c', 'fa_c', 'sp_s', 'br_m', 'text_body', {
        cursor: 'pointer',
        userSelect: 'none',
        border: 'none',
        overflow: 'hidden',
        [css.has('input:checked')]: {
            backgroundColor: css.$t.badge_bg,
            color: css.$t.badge_fg,
            cursor: 'default',
        },
        [css.not(css.has('input:checked'))]: css.mix('outline'),
        [css.media.tablet]: {
            height: '5rem',
            lineHeight: '5rem',
        },
        [css.media.desktop]: {
		    fontSize: css.$v.font_s_small,
        },
    });

    return (
        <label className={base} {...props}>
            <input
                type="radio"
                name={name}
                value={value}
                defaultChecked={defaultChecked}
                className={css.use('hide', {pointerEvents: 'none'})}
                {...checked && {checked}}
            />
            <span>{label}</span>
        </label>
    );
}

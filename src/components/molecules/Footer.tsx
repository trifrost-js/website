import {css} from '../../css';
import {Separator} from '../atoms/Separator';

export function Footer () {
    const cls = css.use('f', 'sp_v_l', 'sp_h_m', 'fj_c', 'fa_c', {
        width: '100%',
        backgroundColor: css.$t.body_bg,
        textAlign: 'center',
        fontSize: css.$v.font_s_small,
        lineHeight: 1.4,
        [css.media.desktop]: css.mix('fh'),
        [css.media.tablet]: css.mix('fv'),
    });

    return <footer className={cls}>
        <span>©2025 Peter Vermeulen &amp; TriFrost contributors</span>
        <Separator style={{[css.media.tablet]: css.mix('hide')}} />
        <span className={css.use('fi', 'fh', 'fa_c', 'fj_c')}>
            <span>Built with TriFrost</span>
            <Separator />
            <span>Licensed under MIT</span>
        </span>
    </footer>;
}

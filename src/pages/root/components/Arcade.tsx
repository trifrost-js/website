import {css} from '../../../css';
import {Link} from '../../../components/atoms/Link';
import {Image} from '../../../components/atoms/Image';

export function Arcade() {
  return (
    <div
      className={css.use('f', 'sm_h_auto', 'panel', 'sp_m', 'br_m', {
        border: '1px solid ' + css.$t.panel_border,
        [css.media.desktop]: css.mix('sm_b_l', 'fh', 'fj_sb', {
          width: '99rem',
        }),
        [css.media.tablet]: css.mix('sm_b_m', 'fh', 'fj_sb', {
          width: '100%',
          maxWidth: '100rem',
        }),
        [css.media.mobile]: css.mix('sm_b_s', 'fv', {gap: css.$v.space_l}),
      })}
    >
      <div className={css.mix('f', 'fv', 'fa_l', {gap: css.$v.space_m})}>
        <h2 className={css.use('sm_b_m', 'text_header')}>🎮 Atomic Arcade</h2>
        <p className={css.use('text_body', 'sm_b_l', {maxWidth: '45rem', lineHeight: 1.4})}>
          A fully server-rendered mini arcade built with zero JS bundles using TriFrost’s Atomic fragment system. SSR-first, fast as hell,
          and just fun.
        </p>
        <div className={css.use('f', 'fh', {gap: css.$v.space_s})}>
          <Link to="https://arcade.trifrost.dev">Try Atomic Arcade</Link>
          <Link to="/docs/jsx-atomic">What is Atomic?</Link>
        </div>
      </div>
      <div>
        <Image src="/assets/atomic.jpg" alt="Atomic Arcade" interactive={false} style={{maxWidth: '25rem'}} />
      </div>
    </div>
  );
}

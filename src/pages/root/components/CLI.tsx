import {css} from '../../../css';
import {Video} from '../../../components/atoms/Video';

export function Cli() {
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
        <h2 className={css.use('sm_b_m', 'text_header')}>🚀 Try the CLI</h2>
        <p className={css.use('text_body', 'sm_b_l', {maxWidth: '40rem', lineHeight: 1.4})}>
          Spin up a new TriFrost project in seconds with a single command, no config, no hassle.
        </p>
        <a
          href="/docs/cli-quickstart"
          title="Try the CLI"
          className={css.use({
            color: css.$t.body_fg,
          })}
        >
          CLI Quickstart Guide
        </a>
      </div>
      <div>
        <Video
          src="/r2assets/trifrost-create.mp4"
          style={{
            maxWidth: '40rem',
            [css.media.mobile]: {maxWidth: '100%'},
          }}
        />
      </div>
    </div>
  );
}

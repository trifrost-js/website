import {css} from '../../../css';

export function PreviewHeader(props: {logo1: JSX.Element; logo2?: JSX.Element}) {
  const cls = css.use('br_m', 'f', 'fh', 'fa_c', {
    width: '100%',
    overflow: 'hidden',
    background: css.$t.body_bg,
    color: css.$t.body_fg,
    [css.media.desktop]: {
      padding: css.$v.space_xl,
      justifyContent: 'center',
      '> span': css.mix('sp_h_xl', {fontSize: css.$v.font_s_title}),
    },
    [css.media.tablet]: {
      padding: css.$v.space_l,
      justifyContent: 'space-around',
      '> span': css.mix('hide'),
    },
  });

  return (
    <div className={cls}>
      {props.logo1}
      {props.logo2 && (
        <>
          <span>+</span>
          {props.logo2}
        </>
      )}
    </div>
  );
}

import {css} from '../../css';
import {ArrowLeft} from './Icons';

export function Back(props: {to: string; label: string; style?: Record<string, unknown>}) {
  const cls = css.use('fi', 'fh', 'fa_c', 'fj_l', 'button', 'button_s', 'button_t_grey', props.style || {});

  return (
    <a className={`back ${cls}`} href={props.to}>
      <ArrowLeft width={8} />
      <span className={css.use('text_body', 'sp_l_s')}>{props.label}</span>
    </a>
  );
}

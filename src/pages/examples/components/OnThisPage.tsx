import {MarkdownLinks} from '../../../components/molecules/MarkdownLinks';
import {css} from '../../../css';

export function OnThisPage({id}: {id: string}) {
  return (
    <nav
      aria-label="Table of contents for example"
      className={css.use('f', 'fv', 'fs0', 'sp_v_l', 'panel', 'br_m', 'sp_h_l', {
        border: '1px solid ' + css.$t.panel_border,
        width: '30rem',
        alignSelf: 'flex-start',
        gap: css.$v.space_l,
        h2: css.mix('text_form_label'),
      })}
    >
      <h2>On this page</h2>
      <MarkdownLinks id={id} />
    </nav>
  );
}

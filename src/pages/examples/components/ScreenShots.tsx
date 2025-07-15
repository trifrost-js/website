import {ExamplesService, type Example} from '../Service';
import {css} from '../../../css';
import {Image} from '../../../components/atoms/Image';
import {Video} from '../../../components/atoms/Video';
import {isNeString} from '@valkyriestudios/utils/string';

export type ScreenShot =
  | {
      file: string;
      title: string;
    }
  | {
      video: string;
      title: string;
    };

export function ScreenShots({entry}: {entry: Example}) {
  if ((!entry?.screenshots || []).length) return <></>;

  return (
    <div
      aria-label="Table of contents for article"
      className={css.use('f', 'fv', 'fs0', 'sp_v_l', 'panel', 'br_m', 'sp_h_l', {
        border: '1px solid ' + css.$t.panel_border,
        width: '30rem',
        alignSelf: 'flex-start',
        gap: css.$v.space_l,
        h2: css.mix('text_form_label'),
      })}
    >
      <h2>Screenshots</h2>
      <div className={css.use('f', 'fv', {gap: css.$v.space_s})}>
        {entry.screenshots.map(el =>
          'file' in el && isNeString(el.file) ? (
            <Image src={ExamplesService.asset(entry, `assets/${el.file}`)} alt={el.title} />
          ) : (
            <Video src={'/r2assets/' + (el as any).video} />
          ),
        )}
      </div>
    </div>
  );
}

import {css} from '../../css';
import {Script} from '../../script';

export function SystemStatus() {
  return (
    <div
      className={css.use('f', 'fh', 'fa_c', 'sp_s', 'br_m', 'sm_r_l', {
        gap: css.$v.space_s,
        fontSize: '1.4rem',
        background: css.$t.panel_bg,
        cursor: 'pointer',
        [css.attr('data-color', 'gray')]: {div: {background: '#666'}},
        [css.attr('data-color', 'orange')]: {div: {background: 'orange'}},
        [css.attr('data-color', 'green')]: {div: {background: 'green'}},
        [css.attr('data-color', 'red')]: {div: {background: 'red'}},
      })}
      data-color="gray"
    >
      <div
        className={css({
          width: '0.8rem',
          height: '0.8rem',
          borderRadius: '50%',
        })}
      />
      <span>Loading status ...</span>
      <Script>
        {({el, $}) => {
          const span = $.query(el, 'span')!;
          async function load() {
            const res = await $.fetch<{color: string; message: string}>('http://localhost:8081/status/badge', {
              credentials: 'omit',
            });
            if (res.ok && res.content) {
              span.textContent = res.content.message;
              el.setAttribute('data-color', res.content.color);
            }
          }
          load();

          $.on(el, 'click', () => (window.location.href = 'https://status.trifrost.dev'));
        }}
      </Script>
    </div>
  );
}

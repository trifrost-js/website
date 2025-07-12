import {css} from '../../css';
import {Script} from '../../script';

type MarkdownLinkEvents = {
  'markdownlinks:rerender': void;
};

declare global {
  interface AtomicRelay extends MarkdownLinkEvents {}
}

type MarkdownLinksPanelOptions = {
  id: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function MarkdownLinks({id, style, ...rest}: MarkdownLinksPanelOptions) {
  const cls = css.use(
    'f',
    'fv',
    {
      a: css.mix('text_body', 'sp_xs', {
        cursor: 'pointer',
        userSelect: 'none',
        border: 'none',
        overflow: 'hidden',
        color: css.$t.body_fg,
        fontSize: css.$v.font_s_small,
        letterSpacing: '.1rem',
        lineHeight: 1.4,
        textDecoration: 'none',
        marginLeft: 0,
        [css.attr('data-level', '5')]: {
          marginLeft: css.$v.space_m,
        },
        [css.hover]: {
          textDecoration: 'underline',
        },
        [css.not(css.lastChild)]: {
          borderBottom: '1px solid ' + css.$t.panel_border,
        },
      }),
    },
    style || {},
  );

  return (
    <div className={cls} {...rest}>
      <Script data={{id}}>
        {({el, data, $}) => {
          function isVisible(el: HTMLElement): boolean {
            // Naive version: walk up the DOM and check for hidden styles
            while (el) {
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden') return false;
              el = el.parentElement!;
            }
            return true;
          }

          function render() {
            const node = document.getElementById(data.id);
            if (!node) return;

            const fragment = document.createDocumentFragment();
            $.queryAll(node, 'h1, h2, h3, h4, h5').forEach(header => {
              if (!header.id) return;

              if (!isVisible(header)) return;

              const link = document.createElement('a');
              link.setAttribute('href', '#' + header.id);
              link.setAttribute('data-level', header.tagName.slice(1));
              link.textContent = header.textContent?.trim() || '';

              fragment.appendChild(link);
            });

            while (el.firstChild) el.removeChild(el.firstChild);
            el.appendChild(fragment);
          }

          render();

          el.$subscribe('markdownlinks:rerender', render);
        }}
      </Script>
    </div>
  );
}

import {Script} from '@trifrost/core/modules/JSX';
import {css} from '../../css';

type CollapsibleProps = {
  title: string;
  tag?: string;
  children: JSX.Element;
  defaultExpanded?: boolean;
  group?: string | null;
  [key: string]: unknown;
};

export function Collapsible({title, tag, children, defaultExpanded = false, group = null, ...rest}: CollapsibleProps) {
  const TAG = tag || 'h2';

  const cls = css({
    borderBottom: '1px solid ' + css.$t.border,
    '>': {
      [TAG]: css.mix('f', 'fh', 'sp_v_l', {
        position: 'relative',
        width: '100%',
        cursor: 'pointer',
        marginTop: 0,
        marginBottom: 0,
        span: css.mix('fg', {userSelect: 'none', pointerEvents: 'none'}),
        [css.after]: css.mix('fs0', {
          display: 'inline-block',
          textAlign: 'right',
          width: '3rem',
        }),
        [css.hover]: {
          color: css.$t.navitem_fg,
          [css.before]: {
            position: 'absolute',
            top: '.6rem',
            left: '-1.1rem',
            right: '-1.1rem',
            bottom: '.6rem',
            content: '""',
            outline: css.$t.outline,
            borderRadius: css.$v.rad_m,
          },
        },
      }),
    },
    [css.is(css.attr('aria-expanded', true))]: {
      '>': {
        [`${TAG}${css.after}`]: {content: '"▼"'},
        div: css.mix('sp_b_l'),
      },
    },
    [css.not(css.attr('aria-expanded', true))]: {
      '>': {
        [`${TAG}${css.after}`]: {content: '"▶"'},
        div: css.mix('hide'),
      },
    },
  });

  if (group) {
    return (
      <section
        id={group}
        className={`collapsible ${cls}`}
        role="region"
        data-group={group}
        aria-labelledby={title}
        {...(defaultExpanded ? {'aria-expanded': 'true'} : {})}
        {...rest}
      >
        <TAG aria-controls={group}>
          <span>{title}</span>
          <Script>
            {el => {
              const parent = el.parentElement!;
              const dgroup = el.getAttribute('aria-controls') as string;
              el.addEventListener('click', () => {
                const isOpen = parent.getAttribute('aria-expanded') + '' === 'true';
                document.querySelectorAll(`[data-group="${dgroup}"]`).forEach(node => node.setAttribute('aria-expanded', 'false'));
                parent.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
              });
            }}
          </Script>
        </TAG>
        <div>{children}</div>
      </section>
    );
  } else {
    return (
      <section
        role="region"
        aria-labelledby={title}
        className={`collapsible ${cls}`}
        {...(defaultExpanded ? {'aria-expanded': 'true'} : {})}
        {...rest}
      >
        <TAG>
          <span>{title}</span>
          <Script>
            {el => {
              const parent = el.parentElement!;
              el.addEventListener('click', () => {
                const isOpen = parent.getAttribute('aria-expanded') + '' === 'true';
                parent.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
              });
            }}
          </Script>
        </TAG>
        <div>{children}</div>
      </section>
    );
  }
}

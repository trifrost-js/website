import {Script} from '../../script';
import {css} from '../../css';

/**
 * Script used for at-boot setting of the theme
 */
export function ThemeSetter() {
  return (
    <Script>
      {() => {
        const saved = localStorage.getItem('trifrost-theme');
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', saved || preferred);
      }}
    </Script>
  );
}

export function Theme() {
  const icon = css.cid();
  const moon = css.cid();
  const sun = css.cid();
  const sunbeams = css.cid();

  const cls = css.use({
    background: 'none',
    border: 'none',
    inlineSize: '4.8rem',
    blockSize: '4.8rem',
    padding: '1.4rem',
    aspectRatio: 1,
    borderRadius: '50%',
    cursor: 'pointer',
    [` .${icon}`]: {
      inlineSize: '100%',
      blockSize: '100%',
      strokeLinecap: 'round',
    },
    [` .${moon}`]: {
      transformOrigin: 'center center',
      fill: css.$t.body_fg,
      circle: {
        transform: 'translateX(0)',
        transition: 'transform .1s ease-in-out',
        willChange: 'transform',
      },
    },
    [` .${sun}`]: {
      transformOrigin: 'center center',
      fill: css.$t.body_fg,
      transition: 'transform .5s cubic-bezier(.5,1.25,.75,1.25)',
    },
    [` .${sunbeams}`]: {
      transformOrigin: 'center center',
      stroke: css.$t.body_fg,
      strokeWidth: '2px',
      transition: 'transform .45s cubic-bezier(.5,1.5,.75,1.25), opacity .5s cubic-bezier(.25,0,.3,1)',
    },
  });

  css.root({
    [`${css.attr('data-theme', 'light')} #theme-switcher`]: {
      svg: {
        mask: {
          circle: {
            transform: 'translateX(0)',
          },
        },
      },
    },
    [`${css.attr('data-theme', 'dark')} #theme-switcher`]: {
      [` .${sun}`]: {
        transform: 'scale(1.75)',
        transitionTimingFunction: 'cubic-bezier(.25,0,.3,1)',
        transitionDuration: '.25s',
      },
      [` .${sunbeams}`]: {
        opacity: 0,
        transform: 'rotateZ(-25deg)',
        transitionDuration: '.15s',
      },
      [` .${moon} circle`]: {
        transform: 'translateX(-7px)',
        transitionDelay: '.15s',
      },
    },
  });

  return (
    <button id="theme-switcher" aria-label="auto" aria-live="polite" className={cls}>
      <svg className={icon} aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
        <mask id="moon-mask" className={moon}>
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle className={sun} cx="12" cy="12" r="6" mask="url(#moon-mask)" />
        <g className={sunbeams}>
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
      <Script>
        {({el, $}) => {
          $.on(el, 'click', () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('trifrost-theme', next);
            el.setAttribute('aria-label', next);
          });
        }}
      </Script>
    </button>
  );
}

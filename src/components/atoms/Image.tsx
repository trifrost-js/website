import {Script} from '../../script';
import {css} from '../../css';

type ImageProps = {
  src: string;
  alt: string;
  style?: Record<string, any>;
  [key: string]: unknown;
};

export function Image({src, alt, style, ...rest}: ImageProps) {
  return (
    <div
      className={css.use(
        'br_m',
        {
          overflow: 'hidden',
          border: '1px solid ' + css.$t.border,
          cursor: 'zoom-in',
          [css.not('[data-loaded]')]: {
            minHeight: '10rem',
          },
          [css.not('[data-viewing]')]: css.mix('outline', {
            [`div${css.nthOfType(2)}`]: css.mix('hide'),
          }),
          [css.attr('data-loaded')]: {div: css.mix('hide')},
          [css.attr('data-error')]: css.mix('hide'),
          [css.attr('data-viewing')]: {
            [`div${css.nthOfType(2)}`]: css.mix('f', 'fa_c', 'fj_c', {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              padding: css.$v.space_xl,
              background: 'rgba(1, 7, 15, .75)',
              zIndex: 200,
              cursor: 'zoom-out',
              marginTop: 0,
            }),
          },
        },
        style || {},
      )}
    >
      <div
        className={css({
          width: '100%',
          height: '100%',
          backgroundColor: css.$t.stencil_bg,
          backgroundImage: css.$t.stencil_anim,
          backgroundSize: '200% 100%',
          animation: `${css.keyframes({
            '0%': {backgroundPosition: '-200% 0'},
            '100%': {backgroundPosition: '200% 0'},
          })} 1.5s infinite`,
          opacity: 1,
          transition: 'opacity 0.3s ease',
        })}
      />
      <img
        src={src}
        alt={alt}
        title={alt}
        loading="lazy"
        className={css({
          display: 'block',
          width: 'auto',
          maxWidth: '100%',
          height: 'auto',
        })}
        {...rest}
      />
      <div>
        <img
          src={src}
          alt={alt}
          title={alt}
          loading="lazy"
          className={css({
            position: 'relative',
            zIndex: 2,
            height: 'auto',
            maxWidth: '80%',
          })}
          {...rest}
        />
      </div>
      <Script>
        {({el, $}) => {
          function loaded() {
            el.setAttribute('data-loaded', 'true');
            el.style.minHeight = 'unset';
          }

          const modal = $.query(el, '> div:last-of-type')!;
          $.on(modal, 'click', () => el.removeAttribute('data-viewing'));

          const img = $.query(el, '> img') as HTMLImageElement;
          img.onerror = () => el.setAttribute('data-error', 'true');
          img.onclick = () => el.setAttribute('data-viewing', 'true');
          img.onload = loaded;

          if (img.complete || img.naturalWidth > 0) loaded();
        }}
      </Script>
    </div>
  );
}

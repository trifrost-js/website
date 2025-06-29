import {Script} from '../../script';
import {css} from '../../css';

type VideoProps = {
  src: string;
  style?: Record<string, any>;
  [key: string]: unknown;
};

export function Video({src, style, ...rest}: VideoProps) {
  return (
    <div
      className={css.use(
        'br_m',
        {
          maxWidth: '100%',
          maxHeight: '40rem',
          overflow: 'hidden',
          [css.not('[data-loaded]')]: {minHeight: '10rem'},
          [css.attr('data-loaded')]: {div: css.mix('hide')},
          [css.attr('data-error')]: css.mix('hide'),
        },
        style || {},
      )}
      {...rest}
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
      <video
        src={src}
        controls
        playsInline
        muted
        preload="metadata"
        className={css({
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        })}
      />
      <Script>
        {({el, $}) => {
          const video = $.query(el, 'video') as HTMLVideoElement;

          video.onerror = () => el.setAttribute('data-error', 'true');

          video.onloadeddata = () => {
            if (!el.hasAttribute('data-error')) {
              el.setAttribute('data-loaded', 'true');
              el.style.minHeight = 'unset';
            }
          };
        }}
      </Script>
    </div>
  );
}

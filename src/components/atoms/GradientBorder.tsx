import {css} from '../../css';

type GradientBorderOptions = {
  children: any;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function GradientBorder({children, style, ...rest}: GradientBorderOptions) {
  return (
    <div
      className={css.use(
        {
          padding: '2px',
          background: 'linear-gradient(270deg, #ff0080, #7928ca, #2afadf, #00ffe7)',
          backgroundSize: '600% 600%',
          animation: `${css.keyframes({
            '0%': {backgroundPosition: '0% 50%'},
            '50%': {backgroundPosition: '100% 50%'},
            '100%': {backgroundPosition: '0% 50%'},
          })} 8s ease infinite`,
        },
        style || {},
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

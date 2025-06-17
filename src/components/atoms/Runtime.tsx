import {css} from '../../css';
import {Script} from '@trifrost/core/modules/JSX';

export type RuntimeName = 'bun' | 'node' | 'workerd';

export type RuntimeBlockOptions = {
  runtime: RuntimeName;
  children: any;
  [key: string]: unknown;
};

export type RuntimeOptions = {
  runtimes: RuntimeName[];
  children: any;
  [key: string]: unknown;
};

export function RuntimeBlock({runtime, children, ...rest}: RuntimeBlockOptions) {
  return (
    <div data-runtime={runtime} {...rest}>
      {children}
    </div>
  );
}

export function Runtime({runtimes, children, ...rest}: RuntimeOptions) {
  const cssBlock: Record<string, unknown> = {};
  for (let i = 0; i < runtimes.length; i++) {
    cssBlock[css.not(css.attr('data-active-runtime', runtimes[i]))] = {
      div: {
        [css.attr('data-runtime', runtimes[i])]: css.mix('hide'),
      },
    };
  }

  return (
    <div className={`runtime ${css.use('panel_alt', 'sp_s', 'br_m', cssBlock)}`} data-active-runtime={runtimes[0]} {...rest}>
      <div className={css.use('f', 'fh', 'fa_c', 'fj_l', 'sm_b_s', {gap: css.$v.space_s})}>
        {runtimes.map(runtime => (
          <button type="button" key={runtime} data-runtime={runtime}>
            {runtime.toUpperCase()}
          </button>
        ))}
      </div>
      <div>{children}</div>
      <Script>
        {el => {
          el.querySelectorAll('button').forEach(node => {
            node.addEventListener('click', () => {
              el.setAttribute('data-active-runtime', node.getAttribute('data-runtime') || '');
            });
          });
        }}
      </Script>
    </div>
  );
}

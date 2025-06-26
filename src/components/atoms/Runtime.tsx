import {css} from '../../css';
import {Script} from '../../script';
import {Radio} from './Radio';

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
    <form className={`runtime ${css.use(cssBlock)}`} data-active-runtime={runtimes[0]} {...rest}>
      <div
        className={css.use('f', 'fh', 'fa_c', 'fj_l', 'sp_xs', 'sm_b_s', 'br_l', {
          border: '4px solid ' + css.$t.panel_border,
        })}
      >
        {runtimes.map(runtime => (
          <Radio name="runtime" value={runtime} label={runtime} />
        ))}
      </div>
      <div>{children}</div>
      <Script data={{runtime: 'bun'}}>
        {(el, data) => {
          data.$bind('runtime', 'input[name="runtime"]');
          data.$watch('runtime', () => el.setAttribute('data-active-runtime', data.runtime));
        }}
      </Script>
    </form>
  );
}

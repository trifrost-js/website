import {Panel} from '../../../components/molecules/Panel';
import {css} from '../../../css';

const features = [
  {
    title: '🧠 Runtime-Agnostic',
    desc: 'Run on Node, Bun, Workerd, uWS — no rewrites',
  },
  {
    title: '📦 Modular Middleware',
    desc: 'Inspired by Koa, written for scale',
  },
  {
    title: '⚡ Zero-cost Abstractions',
    desc: 'Context, Router, ... all inlined for performance',
  },
  {
    title: '📈 Introspectable Tracing',
    desc: 'Otel-native, per-request, per-span, autoredacted',
  },
  {
    title: '📉 Built-in Rate Limiting',
    desc: 'Memory, KV, Redis, DurableObject support',
  },
  {
    title: '🧪 Fully Typed API',
    desc: 'First-class TypeScript support throughout',
  },
];

export function Features() {
  const cls = css.use('f', {
    maxWidth: '100rem',
    [css.media.desktop]: css.mix('fw'),
    [css.media.tablet]: css.mix('fv', {width: '100%'}),
  });

  return (
    <section className={cls}>
      {features.map((f, idx) => (
        <Panel
          key={idx}
          style={css.mix('f', 'fv', {
            gap: css.$v.space_m,
            [css.media.desktop]: css.mix('sm_xs', {width: `calc(50% - ${css.$v.space_xs} - ${css.$v.space_xs})`}),
            [css.media.tablet]: css.mix('sm_v_xs', {width: '100%'}),
          })}
        >
          <h2 className={css.use('text_header')}>{f.title}</h2>
          <p className={css.use('text_body')}>{f.desc}</p>
        </Panel>
      ))}
    </section>
  );
}

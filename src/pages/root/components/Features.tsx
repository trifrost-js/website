import {Panel} from '../../../components/molecules/Panel';
import {css} from '../../../css';

const features = [
  {
    title: '🧠 Runtime-Agnostic',
    desc: 'Run on Node, Bun, Workerd — no rewrites',
  },
  {
    title: '📦 Modular Middleware',
    desc: 'Inspired by Koa, written for hyperspeed edge workloads',
  },
  {
    title: '⚡ Zero-cost Abstractions',
    desc: 'SSR, routing, context all inlined for native performance',
  },
  {
    title: '🧪 Telemetry-First',
    desc: 'Per-request tracing, spans and metrics (Otel-native)',
  },
  {
    title: '🧱 Built-in Rate Limiting',
    desc: 'Plug & play for KV, DurableObject, Redis, Memory',
  },
  {
    title: '🧰 Fully Typed API',
    desc: 'End-to-end TypeScript, infer everything, no magic',
  },
  {
    title: '🧪 Atomic Hydration',
    desc: 'Fragment-safe, SSR-first hydration & automatic cleanup',
  },
  {
    title: '🧬 Data Reactivity',
    desc: 'Built-in reactive data layer, zero config, fully typed',
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

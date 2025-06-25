import {css} from '../../css';

export function SynthBackground() {
  const cls = css({
    position: 'fixed',
    inset: 0,
    bottom: 0,
    zIndex: -1,
    overflow: 'hidden',
    [css.before]: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      inset: 0,
      backgroundImage: css.$t.synth_lines,
      backgroundSize: '50px 50px',
      transform: 'translateY(600px) translateX(0) perspective(1400px) rotateX(70deg)',
      maskImage: 'radial-gradient(circle at center, rgba(255,255,255,1) 30%, rgba(255,255,255,0) 80%)',
    },
  });
  return <div className={cls}></div>;
}

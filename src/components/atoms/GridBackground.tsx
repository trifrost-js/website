import {css} from '../../css';

export function GridBackground() {
  const clsLines = css({
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    pointerEvents: 'none',
    zIndex: -1,
    overflow: 'hidden',
    maxWidth: '100%',
    filter: 'blur(2px)',
    [css.media.mobile]: {
      display: 'none',
    },
    [css.media.tabletOnly]: {
      top: '-20%',
      height: '25%',
      transform: 'perspective(400px) rotateX(-60deg)',
    },
    [css.media.desktop]: {
      top: '-25%',
      height: '40%',
      transform: 'perspective(600px) rotateX(-60deg)',
    },
  });

  const clsLine = css({
    position: 'absolute',
    height: '100%',
    bottom: 0,
    background: 'transparent',
    overflow: 'hidden',
    [css.media.tabletOnly]: {
      maxWidth: '4px',
      [css.nthChild('odd')]: css.mix('hide'),
    },
  });

  const clsLineInner = css({
    content: "''",
    display: 'block',
    position: 'absolute',
    borderRadius: '3px',
    top: '-50%',
    left: 0,
    animationFillMode: 'forwards',
    animationTimingFunction: 'cubic-bezier(0.4, 0.26, 0, 0.97)',
    [css.media.tabletOnly]: {maxWidth: '4px'},
  });

  const palette = [css.$t.aurora_1, css.$t.aurora_2, css.$t.aurora_3];
  const lines = [];

  for (let i = 0; i < 36; i++) {
    const left = i * 2.5 + Math.random() * 1.5;
    const width = +(2 + Math.random() * 4).toFixed(1);
    const height = +(5 + Math.random() * 7).toFixed(1);
    const initialDelay = +(1 + Math.random() * 10).toFixed(2);
    const totalCycle = +(10 + Math.random() * 30).toFixed(2);
    const fadeMid = 30 + Math.floor(Math.random() * 40);
    const color = palette[i % palette.length];

    const drift = Math.random() > 0.5 ? 'translateX(2px)' : 'scaleX(1.05)';
    const anim = css.keyframes({
      '0%': {top: '-50%', opacity: 1, transform: 'none'},
      [`${fadeMid}%`]: {top: '110%', opacity: 0.3, transform: drift},
      '100%': {top: '110%', opacity: 0, transform: 'none'},
    });

    lines.push(
      <div key={i} className={`${clsLine} ${css.use({left: `${left}%`, width: `${width}px`})}`}>
        <div
          className={`${clsLineInner} ${css.use({
            width: `${width}px`,
            height: `${height}vh`,
            background: color,
            animation: `${anim} ${totalCycle}s ${initialDelay}s infinite`,
          })}`}
        />
      </div>,
    );
  }

  return <div className={clsLines}>{lines}</div>;
}

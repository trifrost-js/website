import {Script} from '../../script';
import {css} from '../../css';

export function SynthBackground() {
  const columns = 20;
  const rows = 20;

  return (
    <svg
      width="100%"
      height="40rem"
      xmlns="http://www.w3.org/2000/svg"
      className={css({
        position: 'absolute',
        bottom: 0,
        zIndex: -1,
        transform: 'translateY(500px) translateX(0) perspective(1400px) rotateX(70deg)',
        maskImage: 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0) 80%)',
        [css.media.tablet]: css.mix('hide'),
      })}
    >
      {Array.from({length: columns}).map((_, i) => {
        const x = (i / columns) * 100;
        return <line key={`v-${i}`} x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%" stroke={css.$t.synth_lines} strokeWidth="1" />;
      })}
      {Array.from({length: Math.floor(rows / 2)}).map((_, i) => {
        const y = (i / Math.floor(rows / 2)) * 100;
        return <line key={`h-${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke={css.$t.synth_lines} strokeWidth="1" />;
      })}
      <Script data={{columns, rows}}>
        {(el, data) => {
          const horizontalEntropy = 0.15;

          function addLine(x1: number, y1: number, x2: number, y2: number) {
            const baseHue = 160 + Math.floor(Math.random() * 60);
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.setAttribute('x1', '' + x1);
            l.setAttribute('y1', '' + y1);
            l.setAttribute('x2', '' + x2);
            l.setAttribute('y2', '' + y2);
            l.setAttribute(
              'stroke',
              document.documentElement.getAttribute('data-theme') === 'dark'
                ? `hsla(${baseHue}, 100%, 75%, 0.8)`
                : `hsla(${baseHue}, 75%, 40%, 0.8)`,
            );
            l.setAttribute('stroke-width', '1');
            l.setAttribute('stroke-linecap', 'round');

            el.appendChild(l);

            setTimeout(() => {
              if (l.parentNode === el) el.removeChild(l);
            }, 1600);
          }

          function spawn() {
            const width = el.clientWidth;
            const height = el.clientHeight;

            const colWidth = width / data.columns;
            const rowHeight = height / data.rows;

            let col = Math.floor(Math.random() * data.columns);
            let row = 0;

            let prevX = col * colWidth;
            let prevY = height - row * rowHeight;
            let lastDir = 0;

            function step() {
              if (row >= data.rows) return;

              /* Advance row (always moves up) */
              row++;
              const newY = height - row * rowHeight;

              /* Optionally change column */
              if (Math.random() < horizontalEntropy) {
                let direction;

                /* Bias toward continuing direction */
                if (lastDir !== 0 && Math.random() < 0.7) {
                  direction = lastDir;
                } else {
                  direction = Math.random() < 0.5 ? -1 : 1;
                }

                const nextCol = col + direction;
                if (nextCol >= 0 && nextCol < data.columns) {
                  col = nextCol;
                  lastDir = direction;
                } else {
                  lastDir = 0;
                }
              }

              const newX = col * colWidth;
              if (newX !== prevX) addLine(prevX, prevY, newX, prevY);
              addLine(newX, prevY, newX, newY);
              prevX = newX;
              prevY = newY;

              const lingerChance = 0.25;
              const linger = Math.random() < lingerChance;
              const pauseDuration = linger ? 300 + Math.random() * 400 : 120 + Math.random() * 100;

              setTimeout(step, pauseDuration);
            }

            step();
          }

          setInterval(() => {
            if (Math.random() < 0.5) spawn();
          }, 200);
        }}
      </Script>
    </svg>
  );
}

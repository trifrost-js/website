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
        {({el, data}) => {
          const POOL_SIZE = 64;
          const pool: SVGLineElement[] = [];
          const pool_using: Set<SVGLineElement> = new Set();
          const w = el.clientWidth;
          const h = el.clientHeight;
          const col_w = w / data.columns;
          const row_h = h / data.rows;

          /* Pre-create the pool */
          for (let i = 0; i < POOL_SIZE; i++) {
            const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            l.style.display = 'none'; // Hide initially
            l.setAttribute('stroke-width', '1');
            l.setAttribute('stroke-linecap', 'round');
            el.appendChild(l);
            pool.push(l);
          }

          function getLine(): SVGLineElement | null {
            for (const l of pool) {
              if (!pool_using.has(l)) {
                pool_using.add(l);
                l.style.display = '';
                return l;
              }
            }
            return null; /* Pool exhausted */
          }

          function releaseLine(line: SVGLineElement) {
            pool_using.delete(line);
            line.style.display = 'none';
          }

          function addLine(x1: number, y1: number, x2: number, y2: number) {
            const l = getLine();
            if (!l) return;

            const base_hue = 160 + Math.floor(Math.random() * 60);
            const stroke =
              document.documentElement.getAttribute('data-theme') === 'dark'
                ? `hsla(${base_hue}, 100%, 75%, 0.8)`
                : `hsla(${base_hue}, 75%, 40%, 0.8)`;

            l.setAttribute('x1', '' + x1);
            l.setAttribute('y1', '' + y1);
            l.setAttribute('x2', '' + x2);
            l.setAttribute('y2', '' + y2);
            l.setAttribute('stroke', stroke);

            setTimeout(() => releaseLine(l), 1600);
          }

          function spawn() {
            let col = Math.floor(Math.random() * data.columns);
            let row = 0;

            let prev_x = col * col_w;
            let prev_y = h - row * row_h;
            let last_dir = 0;

            function step() {
              if (row >= data.rows) return;

              row++;
              const new_y = h - row * row_h;

              /* Optional column shift */
              if (Math.random() < 0.15) {
                const dir = last_dir !== 0 && Math.random() < 0.7 ? last_dir : Math.random() < 0.5 ? -1 : 1;
                const next_col = col + dir;
                if (next_col >= 0 && next_col < data.columns) {
                  col = next_col;
                  last_dir = dir;
                } else {
                  last_dir = 0;
                }
              }

              const new_x = col * col_w;
              if (new_x !== prev_x) addLine(prev_x, prev_y, new_x, prev_y);
              addLine(new_x, prev_y, new_x, new_y);
              prev_x = new_x;
              prev_y = new_y;

              setTimeout(step, Math.random() < 0.25 ? 300 + Math.random() * 400 : 120 + Math.random() * 100);
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

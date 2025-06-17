import {humanizeNumber} from "@valkyriestudios/utils/string";
import {Separator} from "../../../components/atoms/Separator";
import {css} from "../../../css";

export function Benchmark () {
	const cls = css.use('f', 'fv', 'panel', 'br_m', {
		width: '100%',
		border: '1px solid ' + css.$t.panel_border,
		[css.media.desktop]: css.mix('sm_t_xs', 'sm_b_m', 'sp_l', {maxWidth: '99rem'}),
		[css.media.tablet]: css.mix('sm_t_xs', 'sm_b_m', 'sp_m', {maxWidth: '100rem'})
	});

	const data = [
		{name: 'TriFrost', rps: 156224, latency: 5.91},
		{name: 'Hono', rps: 140832, latency: 6.63},
		{name: 'Elysia', rps: 138378, latency: 6.77},
		{name: 'Koa', rps: 133968, latency: 6.99},
		{name: 'Express', rps: 103482, latency: 9.19},
	];

	const maxRps = Math.max(...data.map(d => d.rps));

	return (<section className={cls}>
		<div className={css.use('f', 'fh', 'fa_c', 'fj_sb', 'sm_b_l', {width: '100%'})}>
			<h2 className={css.use('text_header')}>🟢 Built for speed</h2>
			<a href="/news/blog/hello_world_benchmark_trifrost" title="Hello World Benchmark" className={css.use({
				color: css.$t.body_fg,
			})}>Learn More</a>
		</div>
		<div className={css.use('f', 'fv', {gap: css.$v.space_s})}>
		  {data.map(({name, rps, latency}) => (
			<div key={name} className={css.use('f', 'fv')}>
			  <div className={css.use('f', 'fh', 'fa_c', 'fj_sb', 'text_body')}>
					<span className={css.use({fontSize: css.$v.font_s_small, fontWeight: 'bold', letterSpacing: '.1rem'})}>{name}</span>
					<span className={css.use('f', 'fh', 'fa_c', {fontSize: css.$v.font_s_small})}>
					<span className={css.use({
						[css.media.mobile]: css.mix('hide'),
					})}>Latency: {humanizeNumber(latency)} ms</span>
					<Separator style={{[css.media.mobile]: css.mix('hide')}} />
					<span>{humanizeNumber(rps)} req/sec</span>
				</span>
			  </div>
			  <div className={css.use('br_s', 'panel_alt', 'sm_v_xs', {
				position: 'relative',
				height: '.6rem',
			  })}>
				<div className={css.use('br_s', {
					height: '100%',
					background: 'linear-gradient(to right, #1484B6, #1f9fc9)',
					animation: `${css.keyframes({
						from: {
							width: '0%',
							opacity: '0',
						},
						to: {
							width: `${(rps/maxRps)*100}%`,
							opacity: name === 'TriFrost' ? 1 : .5,
						},
					})} 1s ease-in-out forwards`,
				})}></div>
			  </div>
			</div>
		  ))}
		</div>
	</section>);
  }

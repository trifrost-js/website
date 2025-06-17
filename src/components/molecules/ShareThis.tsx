import {Twitter, Facebook, LinkedIn} from "../atoms/Icons";
import {css} from "../../css";

type ShareThisOptions = {
	url: string;
	title: string;
};

export function ShareThis({url, title}:ShareThisOptions) {
	const cls = css.use('f', 'fv', 'fa_c', 'fj_c', 'sp_l', {
		width: '100%',
		textAlign: 'center',
		lineHeight: 1.4,
		h4: css.mix('sm_b_l', 'text_body_thin'),
		div: css.mix('f', 'fh', {gap: css.$v.space_l}),
		a: {
			color: css.$t.body_fg,
			opacity: 0.75,
			[css.hover]: {
				opacity: 1,
			},
			[css.active]: {
				svg: {
					color: css.$t.body_fg,
				},
			},
		},
		[css.media.desktop]: css.mix('sm_v_l'),
		[css.media.tablet]: css.mix('sm_t_xl'),
	});

	const enc_url = encodeURIComponent(`https://www.trifrost.dev${url}`);
	const enc_text = encodeURIComponent(`${title} - #trifrost`);

	return (
		<div className={cls}>
			<h4>Loved the read? Share it with others</h4>
			<div>
				<a
					href={`https://twitter.com/intent/tweet?url=${enc_url}&text=${enc_text}`}
					title="Share on Twitter"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Twitter width={48} />
				</a>
				<a
					href={`https://www.linkedin.com/shareArticle?mini=true&url=${enc_url}`}
					title="Share on LinkedIn"
					target="_blank"
					rel="noopener noreferrer"
				>
					<LinkedIn width={48} />
				</a>
				<a
					href={`https://www.facebook.com/sharer/sharer.php?u=${enc_url}`}
					title="Share on Facebook"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Facebook width={48} />
				</a>
			</div>
		</div>
	);
}

import {css} from '../../css';

type Entry = {
	to:string;
	title:string;
};

type Config = {
	entry: Entry;
	label:string;
	alignment: 'l' | 'r';
};

export function Blank () {
	return <div className={css.use('f', 'fs0', 'panel_alt', 'br_m', {
		opacity: .5,
		[css.media.desktop]: css.mix('sp_l', {flexBasis: '50%'}),
		[css.media.tablet]: css.mix('sp_m', 'hide'),
	})}></div>;
}

export function Entry ({entry, label, alignment}:Config) {
	return (<a
		className={css.use('f', 'fs0', 'fg', 'br_m', 'outline', alignment === 'l' && 'fa_l', {
			border: '1px solid ' + css.$t.panel_border,
			cursor: 'pointer',
			gap: css.$v.space_s,
			textDecoration: 'none !important',
			userSelect: 'none',
			[css.media.desktop]: css.mix('fv', alignment === 'r' && 'fa_r', 'fj_c', 'sp_l'),
			[css.media.tablet]: css.mix('fh', alignment === 'r' && 'fa_l', 'fj_l', 'sp_m'),
		})}
		href={entry.to}>
		<strong>{label}</strong>
		<span>{entry.title}</span>
	</a>);
}

export function NextPrevious ({next, previous, reversed = false}:{next:Entry|null, previous:Entry|null, reversed?:boolean}) {
	return <nav aria-label="Previous and next navigation" className={css.use('f', {
		width: '100%',
		marginTop: `${css.$v.space_xl} !important`,
		[css.media.desktop]: css.mix('fh', {gap: css.$v.space_l}),
		[css.media.tablet]: css.mix('fv', {gap: css.$v.space_m}),
	})}>
		{reversed
			? <>
				{previous ? <Entry entry={previous} label="Previous" alignment="l" /> : <Blank />}
				{next ? <Entry entry={next} label="Next" alignment="r" /> : <Blank />}
			</>
			: <>
				{next ? <Entry entry={next} label="Next" alignment="l" /> : <Blank />}
				{previous ? <Entry entry={previous} label="Previous" alignment="r" /> : <Blank />}
			</>}
	</nav>;
}

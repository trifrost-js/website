import {css} from '../../css';
import {Image} from './Image';

export function Picture (props:{title:string, url:string, style?:Record<string, unknown>}) {
	return (<figure className={css.use('fg')}>
		<Image src={props.url} alt={props.title} />
		<figcaption className={css.use('sm_t_s', {fontSize: css.$v.font_s_small})}>
			{props.title}
		</figcaption>
	</figure>);
}

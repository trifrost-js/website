import {css} from '../../css';
import {Image} from './Image';

type PictureProps = {
  title: string;
  url: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
};

export function Picture({title, url, style, ...rest}: PictureProps) {
  return (
    <figure className={css.use('fg', style || {})} {...rest}>
      <Image src={url} alt={title} />
      <figcaption className={css.use('sm_t_s', {fontSize: css.$v.font_s_small})}>{title}</figcaption>
    </figure>
  );
}

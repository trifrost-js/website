import {type Context} from '../types';
import {css} from '../css';
import {Back} from '../components/atoms/Back';
import {Footer} from '../components/molecules/Footer';
import {Root} from '../components/layout/Root';

export async function error(ctx: Context) {
  return ctx.html(
    <Root>
      <div className={css.use('f', 'fg', 'fv', 'fa_c', 'fj_c', 'sp_v_m', {textAlign: 'center', gap: css.$v.space_l})}>
        <h1 className={css.use('text_giga_title')}>Oops!</h1>
        <p className={css.use('text_header_thin', {maxWidth: '65rem'})}>Looks like something went wrong (code:{ctx.statusCode})</p>
        <Back to="/" label="To Safety" />
      </div>
      <Footer />
    </Root>,
  );
}

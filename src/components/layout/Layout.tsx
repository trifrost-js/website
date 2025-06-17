import {css} from '../../css';
import {DocSearch} from '../atoms/DocSearch';
import {Header, type HeaderSection} from '../molecules/Header';
import {Footer} from '../molecules/Footer';
import {Root} from './Root';

export function Layout (props:{
	children:any,
	section:HeaderSection,
	title?:string,
	description?:string|null,
}) {
    return <Root title={props.title} description={props.description}>
        <div className={css.use('f', 'fv', 'sp_s', {
            width: '100%',
            overflowX: 'hidden',
            minHeight: '100%',
            scrollBehavior: 'smooth',
        })}>
            <Header active={props.section} />
            {props.children}
            <Footer />
        </div>
        <DocSearch />
    </Root>;
}

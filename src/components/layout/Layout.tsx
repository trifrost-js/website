import {css} from '../../css';
import {DocSearch} from '../atoms/DocSearch';
import {Header, type HeaderSection} from '../molecules/Header';
import {Footer} from '../molecules/Footer';
import {Root} from './Root';

type LayoutProps = {
  children: any;
  section: HeaderSection;
  title?: string;
  description?: string | null;
};

export function Layout({children, section, title, description}: LayoutProps) {
  return (
    <Root title={title} description={description}>
      <div
        className={css.use('f', 'fv', 'sp_s', {
          width: '100%',
          overflowX: 'hidden',
          minHeight: '100%',
          scrollBehavior: 'smooth',
        })}
      >
        <Header active={section} />
        {children}
        <Footer />
      </div>
      <DocSearch />
    </Root>
  );
}

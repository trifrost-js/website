import {createScript} from '@trifrost/core';
import {type Env} from './types';
import {type CollapsibleEvents} from './components/atoms/Collapsible';
import {type HeaderEvents} from './components/molecules/Header';
import {type DocsEvents} from './pages/docs';
import {type NewsEvents} from './pages/news';

type Events = CollapsibleEvents & HeaderEvents & DocsEvents & NewsEvents;

const {Script, script} = createScript<Env, Events>({atomic: true});
export {Script, script};

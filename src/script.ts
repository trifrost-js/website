import {createScript} from '@trifrost/core';
import {type Env} from './types';
import {type CollapsibleEvents} from './components/atoms/Collapsible';
import {type MarkdownLinkEvents} from './components/molecules/MarkdownLinks';
import {type DocsEvents} from './pages/docs';

type Events = CollapsibleEvents & DocsEvents & MarkdownLinkEvents;

const {Script, script} = createScript<Env, Events>({atomic: true});
export {Script, script};

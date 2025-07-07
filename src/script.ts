import {createScript} from '@trifrost/core';
import {css} from './css';
import {type Env} from './types';
import {type CollapsibleEvents} from './components/atoms/Collapsible';
import {type MarkdownLinkEvents} from './components/molecules/MarkdownLinks';
import {type DocsEvents} from './pages/docs';

type Events = CollapsibleEvents & DocsEvents & MarkdownLinkEvents;

const config = {
  atomic: true,
  css,
} as const;

const {Script, script, Module} = createScript<typeof config, Env, Events>(config);
export {Script, script, Module};

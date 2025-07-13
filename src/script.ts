import {createModule, createScript} from '@trifrost/core';
import {css} from './css';
import {type Env} from './types';

export const {Module} = createModule({css});

const config = {
  atomic: true,
  css,
  modules: {},
} as const;

const {Script, script} = createScript<typeof config, Env>(config);
export {Script, script};

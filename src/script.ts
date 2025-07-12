import {createScript} from '@trifrost/core';
import {css} from './css';
import {type Env} from './types';

const config = {
  atomic: true,
  css,
} as const;

const {Script, script, Module} = createScript<typeof config, Env>(config);
export {Script, script, Module};

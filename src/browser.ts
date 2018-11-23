import Such from './such';
import { NormalObject } from './types';
Such.define('boolean', (utils: NormalObject) => {
  return utils.isOptional();
});
(window as NormalObject).Such = Such;

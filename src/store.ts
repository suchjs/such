import { NormalObject } from './types';
interface Store {
  (name: string, value: any, alwaysVar: boolean): void;
  vars: NormalObject;
  fns: NormalObject;
  mockits: NormalObject;
}
const store: Store  = (() => {
  const fns: {[index: string]: () => any} = {};
  const vars: NormalObject = {};
  const fn = (name: string, value: any, alwaysVar: boolean): void => {
    if(typeof value !== 'function' || alwaysVar) {
      vars[name] = value;
    } else {
      fns[name] = value;
    }
  };
  fn.fns = fns;
  fn.vars = vars;
  fn.mockits = {};
  return fn;
})();
export default store;

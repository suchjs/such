import { TObject } from './types';
export interface Store {
  (name: string, value: any, alwaysVar: boolean): void;
  vars: TObject;
  fns: TObject;
  mockits: TObject;
  alias: TObject;
  aliasTypes: string[];
  fileCache: TObject;
  config: TObject;
}
declare const store: Store;
export default store;

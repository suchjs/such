import { NormalObject } from './types';
export interface Store {
    (name: string, value: any, alwaysVar: boolean): void;
    vars: NormalObject;
    fns: NormalObject;
    mockits: NormalObject;
}
declare const store: Store;
export default store;

import Mockit from '../core/mockit';
import { TObj, TFunc, TStrList } from '../types/common';
import { TMModifierFn, TMRuleFn } from '../types/mockit';
import { TSSConfig } from '../types/node';
declare type MockitsCache<T> = TObj<{
    rules: TStrList;
    ruleFns: TObj<TMRuleFn>;
    modifiers: TStrList;
    modifierFns: TObj<TMModifierFn<T>>;
    define?: TObj;
}>;
export interface IFileCache {
    mtime: number;
    content: string;
}
export interface Store {
    (name: string, value: unknown, alwaysVar: boolean): void;
    vars: TObj;
    fns: TObj<TFunc>;
    mockits: TObj<Mockit | unknown>;
    mockitsCache: MockitsCache<unknown>;
    alias: TObj<string>;
    aliasTypes: TStrList;
    fileCache: {
        [index: string]: IFileCache | TStrList | string;
    };
    config: TSSConfig;
}
export declare const isFileCache: (target: IFileCache | string | TStrList) => target is IFileCache;
declare const store: Store;
export default store;

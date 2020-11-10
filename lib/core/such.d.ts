import PathMap, { TFieldPath } from '../helpers/pathmap';
import * as utils from '../helpers/utils';
import Mockit from './mockit';
import { TObj } from '../types/common';
import { TSuchSettings } from '../types/node';
import { IParserConfig } from '../types/parser';
import { IAsOptions, IMockerKeyRule, IMockerOptions, IPromiseResult } from '../types/instance';
export declare class Mocker {
    static parseKey(key: string): {
        key: string;
        config: TObj;
    };
    result: unknown;
    readonly target: unknown;
    readonly config: IMockerKeyRule;
    readonly path: TFieldPath;
    readonly type: string;
    readonly instances?: PathMap<Mocker>;
    readonly datas?: PathMap<unknown>;
    readonly root: Mocker;
    readonly parent: Mocker;
    readonly dataType: string;
    readonly isRoot: boolean;
    readonly mockFn: (dpath: TFieldPath) => unknown;
    readonly mockit: Mockit;
    readonly promises: IPromiseResult[];
    constructor(options: IMockerOptions, rootInstances?: PathMap<Mocker>, rootDatas?: PathMap<unknown>);
    setParams(value: string | TObj): TObj | never;
    mock(dpath: TFieldPath): unknown;
}
export default class Such {
    static readonly utils: typeof utils;
    static alias(short: string, long: string): void | never;
    static config(config: TSuchSettings): void;
    static parser(name: string, params: {
        config: IParserConfig;
        parse: () => void;
        setting?: TObj;
    }): never | void;
    static as(target: unknown, options?: IAsOptions): unknown;
    static instance(target: unknown, options?: IAsOptions): Such;
    static assign(name: string, value: unknown, alwaysVar?: boolean): void;
    static define(type: string, ...args: unknown[]): void | never;
    readonly target: unknown;
    readonly options: IAsOptions;
    readonly mocker: Mocker;
    readonly instances: PathMap<Mocker>;
    readonly mockits: PathMap<TObj>;
    readonly datas: PathMap<unknown>;
    readonly paths: PathMap<TFieldPath>;
    protected struct: TObj;
    private initail;
    constructor(target: unknown, options?: IAsOptions);
    a(): unknown;
}

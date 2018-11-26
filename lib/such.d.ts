import PathMap, { Path } from './helpers/pathmap';
import { NormalObject } from './types';
export interface SuchConfig {
    instance?: boolean;
    config?: KeyRuleInterface;
}
export interface KeyRuleInterface {
    min?: number;
    max?: number;
    optional?: boolean;
    oneOf?: boolean;
    alwaysArray?: boolean;
}
export interface MockitInstances {
    [index: string]: any;
}
export interface MockerOptions {
    target: any;
    path: Path;
    parent?: Mocker;
    config?: KeyRuleInterface;
}
export interface MockitOptions {
    param: string;
    ignoreRules?: string[];
    init?: () => void;
    generate?: () => any;
    generateFn?: () => void;
}
export declare class Mocker {
    static parseKey(key: string): {
        key: string;
        config: NormalObject;
    };
    readonly target: any;
    readonly config: NormalObject;
    readonly path: Path;
    readonly type: string;
    readonly instances?: PathMap<Mocker>;
    readonly datas?: PathMap<any>;
    readonly root: Mocker;
    readonly parent: Mocker;
    readonly dataType: string;
    readonly isRoot: boolean;
    readonly mockFn: (dpath: Path) => any;
    readonly mockit: NormalObject;
    constructor(options: MockerOptions, rootInstances?: PathMap<Mocker>, rootDatas?: PathMap<any>);
    setParams(value: string | NormalObject): any;
    mock(dpath: Path): any;
}
export default class Such {
    static readonly utils: {
        [index: string]: (...args: any[]) => any;
    };
    static as(target: any, options?: SuchConfig): any;
    static assign(name: string, value: any, alwaysVar?: boolean): void;
    static define(type: string, ...args: any[]): void | never;
    readonly target: any;
    readonly options: SuchConfig;
    readonly mocker: Mocker;
    readonly instances: PathMap<Mocker>;
    readonly datas: PathMap<any>;
    protected struct: NormalObject;
    private initail;
    constructor(target: any, options?: SuchConfig);
    a(): any;
}

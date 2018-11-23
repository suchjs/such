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
    xpath: Array<string | number>;
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
export declare type Xpath = Array<string | number>;
export declare class ArrKeyMap<T> {
    private hashs;
    private keyHashs;
    private rootKey;
    set(key: Xpath, value: T): this;
    get(key: Xpath): T;
    clear(): void;
    private buildKey;
}
export declare class Mocker {
    static parseKey(key: string): {
        key: string;
        config: NormalObject;
    };
    readonly target: any;
    readonly config: NormalObject;
    readonly xpath: Xpath;
    readonly type: string;
    readonly instances?: ArrKeyMap<Mocker>;
    readonly datas?: ArrKeyMap<any>;
    readonly root: Mocker;
    readonly parent: Mocker;
    readonly dataType: string;
    readonly isRoot: boolean;
    readonly mockFn: (dpath: Xpath) => any;
    readonly mockit: NormalObject;
    constructor(options: MockerOptions, rootInstances?: ArrKeyMap<Mocker>, rootDatas?: ArrKeyMap<any>);
    setParams(value: string | NormalObject): any;
    mock(dpath?: Xpath): any;
}
export default class Such {
    static as(target: any, options?: SuchConfig): any;
    static assign(name: string, value: any, alwaysVar?: boolean): void;
    static define(type: string, ...args: any[]): void | never;
    readonly target: any;
    readonly options: SuchConfig;
    readonly mocker: Mocker;
    readonly instances: ArrKeyMap<Mocker>;
    readonly datas: ArrKeyMap<any>;
    protected struct: NormalObject;
    private initail;
    constructor(target: any, options?: SuchConfig);
    a(): any;
}

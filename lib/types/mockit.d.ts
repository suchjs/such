import { TConstructor, TObj } from './common';
import { IPPConfig, IPPFormat, IPPFunc, IPPLength, IPPPath, IPPRegexp, IPPSize } from './parser';
import Mockit from '../core/mockit';
export declare type TMModifierFn<T> = (res: T) => T | string | never;
export declare type TMRuleFn<T = unknown> = (cur: T) => T | void;
export declare type TMConfigFullRule<U = any, T = TConstructor<U | any>> = {
    type: T;
    default?: U | (() => U);
    validator?: () => boolean | never;
    required?: boolean;
};
export declare type TMConfigRule<T = TConstructor> = T | T[] | TMConfigFullRule;
export declare type TMConfig<T = TConstructor> = TObj<TMConfigRule<T>>;
export declare type TMParams = {
    [index: string]: unknown;
    Config?: IPPConfig;
    Func?: IPPFunc;
    Format?: IPPFormat;
    Path?: IPPPath;
    Length?: IPPLength;
    Size?: IPPSize;
    Regexp?: IPPRegexp;
};
export declare type TMFactoryOptions = {
    param?: string;
    configOptions?: TObj;
    init?: () => void;
    generate: () => unknown;
    generateFn?: () => void;
};
export declare type TMClass = new (...args: unknown[]) => Mockit;
export declare type TMClassList = TObj<TMClass>;

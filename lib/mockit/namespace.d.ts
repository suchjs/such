import { NormalObject, SuchOptions } from '../types';
export declare type Result<T> = T | never;
export declare type ModifierFn<T> = (res: T) => T | string | never;
export declare type RuleFn = (cur: NormalObject) => void | NormalObject;
export default abstract class Mockit<T> {
    protected readonly constructorName: string;
    protected params: NormalObject;
    protected origParams: NormalObject;
    protected generateFn: undefined | ((options: SuchOptions) => Result<T>);
    protected isValidOk: boolean;
    protected hasValid: boolean;
    protected invalidKeys: string[];
    constructor(constructorName: string);
    abstract init(): void;
    addModifier(name: string, fn: ModifierFn<T>, pos?: string): void;
    addRule(name: string, fn: RuleFn, pos?: string): void;
    setParams(params: NormalObject, value: undefined): NormalObject | never;
    setParams(key: string, value: NormalObject): NormalObject | never;
    frozen(): this;
    reGenerate(fn?: (options: SuchOptions) => Result<T>): void;
    make(options: SuchOptions): Result<T>;
    abstract generate(options: SuchOptions): Result<T>;
    abstract test(target: T): boolean;
    private add(type, name, fn, pos?);
    private validParams(params?);
    private validate(params?);
    private resetValidInfo();
}

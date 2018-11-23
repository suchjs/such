import { NormalObject, ParamsFunc } from '../types';
export declare type Result<T> = T | never;
export declare type ModifierFn<T> = (res: T) => T | string | never;
export declare type RuleFn = (cur: NormalObject) => void | NormalObject;
export default abstract class Mockit<T> {
    protected readonly constructorName: string;
    protected userFns: NormalObject;
    protected userFnQueue: string[];
    protected userFnParams: NormalObject;
    protected params: NormalObject;
    protected generateFn: undefined | (() => Result<T>);
    protected ignoreRules: string[];
    constructor(constructorName: string);
    abstract init(): void;
    addModifier(name: string, fn: ModifierFn<T>, pos?: string): void;
    addRule(name: string, fn: RuleFn, pos?: string): void;
    setParams(params: NormalObject, value: undefined): NormalObject | never;
    setParams(key: string, value: NormalObject): NormalObject | never;
    reGenerate(fn?: () => Result<T>): void;
    make(Such?: NormalObject): Result<T>;
    abstract generate(): Result<T>;
    abstract test(target: T): boolean;
    protected parseFuncParams(Func: ParamsFunc): void;
    private add;
}

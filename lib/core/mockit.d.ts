import { TResult, TStrList, TObj } from '../types/common';
import { TMConfig, TMModifierFn, TMParams, TMRuleFn } from 'src/types/mockit';
import { TSuchInject } from 'src/types/instance';
export default abstract class Mockit<T = unknown> {
    protected readonly constructorName: string;
    params: TMParams;
    protected configOptions: TMConfig;
    protected origParams: TMParams;
    protected generateFn: undefined | ((options: TSuchInject) => TResult<T>);
    protected isValidOk: boolean;
    protected hasValid: boolean;
    protected invalidKeys: TStrList;
    constructor(constructorName: string);
    protected get constrName(): string;
    abstract init(): void;
    addModifier(name: string, fn: TMModifierFn<T>, pos?: string): void | never;
    addRule(name: string, fn: TMRuleFn, pos?: string): void | never;
    setParams(params: TObj, value?: undefined): TObj | never;
    setParams(key: string, value: TObj): TObj | never;
    frozen(): Mockit<T>;
    reGenerate(fn?: (options: TSuchInject) => TResult<T>): void;
    make(options: TSuchInject): TResult<T>;
    abstract generate(options: TSuchInject): TResult<T>;
    abstract test(target: T): boolean;
    private add;
    private validParams;
    private validate;
    private resetValidInfo;
    private runModifiers;
    private runFuncs;
    private runAll;
}
export declare class BaseExtendMockit extends Mockit {
    init(): void;
    test(): boolean;
    generate(): any;
}

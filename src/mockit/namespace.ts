import { TResult, TStrList } from '../types/common';
import { IPPConfig, IPPFunc, IPPFuncOptions } from '../types/parser';
import {
  deepCopy,
  getExpValue,
  isFn,
  isNoEmptyObject,
  isObject,
  isPromise,
  typeOf,
  withPromise,
} from '../helpers/utils';
import store from '../store';
import {
  MockitConfig,
  MockitConfigItem,
  TObj,
  ParamsFunc,
  ParamsFuncOptions,
  SuchOptions,
  TypeConstructor,
} from '../types';
import { TMModifierFn, TMRuleFn } from 'src/types/mockit';
const { fns: globalFns, vars: globalVars, mockitsCache } = store;
//

/**
 * abstrct class Mockit
 * mockit抽象类：所有模拟的数据类型继承自该类
 * @export
 * @abstract
 * @class Mockit
 * @template T
 */
export default abstract class Mockit<T = unknown> {
  protected configOptions: MockitConfig = {};
  protected params: TObj = {};
  protected origParams: TObj = {};
  protected generateFn: undefined | ((options: SuchOptions) => TResult<T>);
  protected isValidOk = false;
  protected hasValid = false;
  protected invalidKeys: TStrList = [];
  /**
   * create an instance of Mockit.
   * 构造函数
   * @memberof Mockit
   */
  constructor(protected readonly constructorName: string) {
    const constrName = constructorName || this.constructor.name;
    if (mockitsCache[constrName]) {
      const { define } = mockitsCache[constrName];
      if (isObject(define)) {
        Object.keys(define).map((key) => {
          const value = define[key];
          // force to add defines
          const self = (this as unknown) as TObj;
          if (typeOf(value) === 'Object') {
            self[key] = deepCopy({}, value);
          } else {
            self[key] = value;
          }
        });
      }
      return;
    }
    mockitsCache[constrName] = {
      rules: [],
      ruleFns: {},
      modifiers: [],
      modifierFns: {},
    };
    this.init();
    // all type support modifiers
    this.addRule('Func', function (Func: IPPFunc) {
      if (!Func) {
        return;
      }
      const options = Func.options;
      for (let i = 0, j = options.length; i < j; i++) {
        const item: IPPFuncOptions = options[i];
        const { name, params } = item;
        params.map((param) => {
          // if object, valid
          if (param.variable) {
            try {
              if (typeof param.value === 'string') {
                if (
                  param.value.indexOf('.') > -1 ||
                  param.value.indexOf('[') > -1
                ) {
                  new Function(
                    '__CONFIG__',
                    'return __CONFIG__.' + param.value,
                  )(globalVars);
                } else if (!globalVars.hasOwnProperty(param.value)) {
                  throw new Error(`"${param.value} is not assigned."`);
                }
              }
            } catch (e) {
              throw new Error(
                `the modifier function ${name}'s param ${param.value} is not correct:${e.message}`,
              );
            }
          }
        });
      }
    });
    const { configOptions } = this;
    // if set configOptions,validate config
    if (isNoEmptyObject(configOptions)) {
      this.addRule('Config', function (Config: TObj) {
        const last = deepCopy({}, Config || {}) as IPPConfig;
        Object.keys(configOptions).map((key: string) => {
          const cur: MockitConfigItem<unknown> = configOptions[key];
          let required = false;
          let def: unknown;
          let type: TypeConstructor | TypeConstructor[];
          const typeNames: string[] = [];
          let validator = (target: unknown) => {
            const targetType = typeOf(target);
            const allTypes = typeOf(type) === 'Array' ? type : [type];
            let flag = false;
            (allTypes as TypeConstructor[]).map((Cur) => {
              const curName = Cur.name;
              typeNames.push(curName);
              if (!flag) {
                flag = targetType === curName;
              }
            });
            return flag;
          };
          const hasKey = last.hasOwnProperty(key);
          if (isObject(cur)) {
            required = !!cur.required;
            def = isFn(cur.default) ? cur.default() : cur.default;
            type = cur.type;
            validator = isFn<typeof validator>(cur.validator)
              ? cur.validator
              : validator;
          }
          if (required && !hasKey) {
            throw new Error(`${constrName} required set config "${key}"`);
          } else if (hasKey && !validator.call(null, last[key])) {
            // tslint:disable-next-line:max-line-length
            throw new Error(
              `the config of "${key}"'s value ${
                last[key]
              } is not instance of ${typeNames.join(',')}`,
            );
          } else {
            if (!hasKey && def !== undefined) {
              last[key] = def;
            }
          }
        });
        return last;
      });
    }
  }
  /**
   * get construct name
   * 获取当前类名
   * @readonly
   * @protected
   * @type {string}
   * @memberof Mockit
   */
  protected get constrName(): string {
    return this.constructorName || this.constructor.name;
  }

  /**
   *
   *
   * @abstract
   * @memberof Mockit
   */
  public abstract init(): void;
  /**
   *
   *
   * @param {string} name
   * @param {TMModifierFn<T>} fn
   * @param {string} [pos]
   * @returns
   * @memberof Mockit
   */
  public addModifier(
    name: string,
    fn: TMModifierFn<T>,
    pos?: string,
  ): void | never {
    return this.add('modifier', name, fn, pos);
  }
  /**
   *
   *
   * @param {string} name
   * @param {TMRuleFn} fn
   * @param {string} [pos]
   * @returns
   * @memberof Mockit
   */
  public addRule(name: string, fn: TMRuleFn, pos?: string): void | never {
    return this.add('rule', name, fn, pos);
  }
  /**
   *
   *
   * @param {TObj} params
   * @param {undefined} value
   * @returns {(TObj|never)}
   * @memberof Mockit
   */
  public setParams(params: TObj, value: undefined): TObj | never;
  public setParams(key: string, value: TObj): TObj | never;
  public setParams(key: unknown, value: unknown): TObj | never {
    let params: TObj = {};
    if (typeof key === 'object' && value === undefined) {
      params = key as TObj;
    } else if (typeof key === 'string') {
      params[key] = value;
    }
    this.resetValidInfo();
    deepCopy(this.origParams, params);
    deepCopy(this.params, params);
    // must after copy,otherwise will override modified values
    this.validate();
    return this.origParams;
  }
  /**
   *
   *
   * @memberof Mockit
   */
  public frozen(): Mockit<T> {
    // frozen params for extend type.
    const constrName = this.constructorName || this.constructor.name;
    const { params, origParams, generateFn, configOptions } = this;
    mockitsCache[constrName].define = deepCopy(
      {},
      {
        params,
        origParams,
        configOptions,
        generateFn,
      },
    );
    return this;
  }
  /**
   *
   *
   * @param {() => TResult<T>} [fn]
   * @memberof Mockit
   */
  public reGenerate(fn?: (options: SuchOptions) => TResult<T>): void {
    this.generateFn = fn;
  }
  /**
   *
   *
   * @param {TObj} [Such]
   * @returns {TResult<T>}
   * @memberof Mockit
   */
  public make(options: SuchOptions): TResult<T> {
    this.validate();
    // tslint:disable-next-line:max-line-length
    let result =
      typeof this.generateFn === 'function'
        ? this.generateFn.call(this, options)
        : this.generate(options);
    let isPromRes = isPromise(result);
    if (!isPromRes && typeOf(result) === 'Array') {
      result = withPromise(result);
      isPromRes = isPromise(result[0]);
      if (isPromRes) {
        result = Promise.all(result);
      }
    }
    // judge if promise
    return isPromRes
      ? result.then((res: any) => {
          return this.runAll(res, options);
        })
      : this.runAll(result, options);
  }
  /**
   *
   *
   * @abstract
   * @returns {TResult<T>}
   * @memberof Mockit
   */
  public abstract generate(options: SuchOptions): TResult<T>;
  /**
   *
   *
   * @abstract
   * @param {T} target
   * @returns {boolean}
   * @memberof Mockit
   */
  public abstract test(target: T): boolean;
  /**
   *
   *
   * @private
   * @param {("rule"|"modifier")} type
   * @param {string} name
   * @param {(TMRuleFn|TMModifierFn<T>)} fn
   * @param {string} [pos]
   * @returns {(never|void)}
   * @memberof Mockit
   */
  private add(
    type: 'rule' | 'modifier',
    name: string,
    fn: TMRuleFn | TMModifierFn<T>,
    pos?: string,
  ): never | void {
    const curName = this.constructorName || this.constructor.name;
    const { rules, ruleFns, modifiers, modifierFns } = mockitsCache[curName];
    let target;
    let fns;
    if (type === 'rule') {
      target = rules;
      fns = ruleFns;
    } else {
      target = modifiers;
      fns = modifierFns;
    }
    if (target.indexOf(name) > -1) {
      throw new Error(`${type} of ${name} already exists`);
    } else {
      if (typeof pos === 'undefined' || pos.trim() === '') {
        target.push(name);
      } else {
        let prepend = false;
        if (pos.charAt(0) === '^') {
          prepend = true;
          pos = pos.slice(1);
        }
        if (pos === '') {
          target.unshift(name);
        } else {
          const findIndex = target.indexOf(pos);
          if (findIndex < 0) {
            throw new Error(`no exists ${type} name of ${pos}`);
          } else {
            target.splice(findIndex + (prepend ? 0 : 1), 0, name);
          }
        }
      }
      fns[name] = fn;
    }
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private validParams(): boolean {
    const params = this.origParams;
    const { rules, ruleFns } = mockitsCache[
      this.constructorName || this.constructor.name
    ];
    const keys = Object.keys(params);
    rules.map((name: string) => {
      try {
        const res = ruleFns[name].call(this, params[name]);
        if (typeof res === 'object') {
          this.params[name] = res;
        }
        const index = keys.indexOf(name);
        if (index > -1) {
          keys.splice(index, 1);
        }
      } catch (e) {
        this.invalidKeys.push(`[(${name})${e.message}]`);
      }
    });
    return this.invalidKeys.length === 0;
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private validate(): void | never {
    const { invalidKeys } = this;
    if (!this.hasValid) {
      this.isValidOk = this.validParams();
      this.hasValid = true;
    }
    if (!this.isValidOk) {
      throw new Error(`invalid params:${invalidKeys.join(',')}`);
    }
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private resetValidInfo(): void {
    this.isValidOk = false;
    this.hasValid = false;
    this.invalidKeys = [];
  }
  /**
   *
   *
   * @private
   * @param {*} result
   * @param {SuchOptions} options
   * @returns
   * @memberof Mockit
   */
  private runModifiers(result: unknown, options: SuchOptions): unknown {
    const { params } = this;
    const { modifiers, modifierFns } = mockitsCache[
      this.constructorName || this.constructor.name
    ];
    for (let i = 0, j = modifiers.length; i < j; i++) {
      const name = modifiers[i];
      if (params.hasOwnProperty(name)) {
        const fn = modifierFns[name];
        const args = [result, params[name], options];
        result = fn.apply(this, args);
      }
    }
    return result;
  }
  /**
   *
   *
   * @private
   * @param {*} result
   * @param {SuchOptions} options
   * @returns
   * @memberof Mockit
   */
  private runFuncs(result: unknown, options: SuchOptions): unknown {
    const { Config, Func } = this.params;
    if (Func) {
      const { queue, params: fnsParams, fns } = Func as IPPFunc;
      for (let i = 0, j = queue.length; i < j; i++) {
        const name = queue[i];
        const fn = fns[i];
        const args: unknown[] = ((globalFns[name]
          ? [globalFns[name]]
          : []) as unknown[]).concat([
          fnsParams[i],
          globalVars,
          result,
          (Config as IPPConfig) || {},
          getExpValue,
        ]);
        result = fn.apply(options, args);
      }
    }
    return result;
  }
  /**
   *
   *
   * @private
   * @param {*} result
   * @param {SuchOptions} options
   * @returns
   * @memberof Mockit
   */
  private runAll(result: unknown, options: SuchOptions) {
    result = this.runModifiers(result, options);
    return this.runFuncs(result, options);
  }
}

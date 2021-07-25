import { TResult, TStrList, TObj } from '../types/common';
import { IPPConfig, IPPFunc } from '../types/parser';
import {
  deepCopy,
  getExpValue,
  isFn,
  isNoEmptyObject,
  isObject,
  typeOf,
} from '../helpers/utils';
import store from '../data/store';
import {
  TMConfig,
  TMModifierFn,
  TMParams,
  TMAttrs,
  TMRuleFn,
  TMParamsValidFn,
  TMFactoryOptions,
} from '../types/mockit';
import { TSuchInject } from '../types/instance';
import { TStaticSuch } from './such';
import { PRE_PROCESS, isPreProcessFn, setPreProcessFn } from '../data/mockit';

const { fns: globalFns, vars: globalVars, mockitsCache } = store;
/**
 * abstrct class Mockit
 * @export
 * @abstract
 * @class Mockit
 * @template T
 */
export default abstract class Mockit<T = unknown> {
  public params: TMParams = {};
  // allowed data attribute
  public readonly allowAttrs: TMAttrs = [];
  // if config options is set, will allow configuration `data attribute`
  public configOptions: TMConfig = {};
  // validate all params
  public validator: TMParamsValidFn;
  protected initParams: TMParams = {};
  protected isValidOk = false;
  protected hasValid = false;
  protected invalidKeys: TStrList = [];
  /**
   * create an instance of Mockit.
   * constructor
   * pay attention the constrName value
   * the built-in type should use a same style
   * @memberof Mockit
   */
  constructor(public readonly constrName: string) {
    if (mockitsCache[constrName]) {
      const { define } = mockitsCache[constrName];
      if (isObject(define)) {
        Object.keys(define).map((key: keyof TMFactoryOptions) => {
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
    // intialize
    this.init();
    // when use 'bind', the function become another handle
    // all mockits allow funcs
    this.addRule('$func', setPreProcessFn(PRE_PROCESS.$func.bind(this)));
    // if set configOptions,validate config
    const { configOptions } = this;
    if (isNoEmptyObject(configOptions)) {
      this.addRule('$config', setPreProcessFn(PRE_PROCESS.$config.bind(this)));
    }
    // cached the mockit, frozen all data
    this.frozen();
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
  public setParams(key: TObj, value?: boolean): TObj | never;
  public setParams(key: string, value: TObj, init?: boolean): TObj | never;
  public setParams(key: unknown, value: unknown, init?: boolean): TObj | never {
    let params: TObj;
    let isInit = false;
    if (typeof key === 'object') {
      if (value === true) {
        params = key as TObj;
        isInit = true;
      } else if (value === undefined) {
        params = key as TObj;
      }
    } else if (typeof key === 'string') {
      params = {
        [key]: value,
      };
      isInit = init;
    }
    this.resetValidInfo();
    // when init, copy the params into init params
    if (isInit) {
      deepCopy(this.initParams, params);
    }
    deepCopy(this.params, params);
    // must after copy,otherwise will override modified values
    this.validate();
    return this.initParams;
  }
  /**
   * setAllowAttrs
   * @returns
   */
  public setAllowAttrs(...names: string[]): void {
    names.forEach((name) => {
      if (!this.allowAttrs.includes(name)) {
        this.allowAttrs.push(name);
      }
    });
  }
  /**
   *
   *
   * @memberof Mockit
   */
  public frozen(): Mockit<T> {
    // frozen params for extend type.
    const {
      params,
      initParams,
      generate,
      validator,
      configOptions,
      allowAttrs,
    } = this;
    mockitsCache[this.constrName].define = deepCopy(
      {},
      {
        params,
        initParams,
        configOptions,
        generate,
        validator,
        allowAttrs,
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
  public reGenerate(
    fn?: (options?: TSuchInject, such?: TStaticSuch) => TResult<T>,
  ): void {
    this.generate = fn;
  }
  /**
   *
   *
   * @param {TObj} [Such]
   * @returns {TResult<T>}
   * @memberof Mockit
   */
  public make(options: TSuchInject, such: TStaticSuch): unknown {
    // validate params, and cache the result
    this.validate();
    // generate a result
    const result = this.generate(options, such);
    // judge if promise
    return this.runAll(result, options);
  }
  /**
   *
   *
   * @abstract
   * @returns {TResult<T>}
   * @memberof Mockit
   */
  public abstract generate(options: TSuchInject, such: TStaticSuch): TResult<T>;
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
    const curName = this.constrName;
    const { rules, ruleFns, modifiers, modifierFns } = mockitsCache[curName];
    const isRuleType = type === 'rule';
    let target;
    let fns;
    if (isRuleType) {
      target = rules;
      fns = ruleFns;
    } else {
      target = modifiers;
      fns = modifierFns;
    }
    if (target.includes(name)) {
      // if has ever added a handle that not PRE_PROCESS handle, ignore the PRE_PROCESS handle
      // otherwise, override the handle
      if (PRE_PROCESS.hasOwnProperty(name)) {
        if (isPreProcessFn(fn)) {
          return;
        }
      } else {
        throw new Error(`${type} of ${name} already exists`);
      }
    }
    // when add a rule, auto add the rule name to allowAttrs
    if (isRuleType) {
      this.setAllowAttrs(name);
    }
    // add by position
    if (pos === undefined || pos.trim() === '') {
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
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private validParams(): boolean {
    const { params, validator } = this;
    const { rules, ruleFns } = mockitsCache[this.constrName];
    const keys = Object.keys(params);
    const execute = function (name: string, cb: TMRuleFn<unknown>) {
      const res = cb.call(this, params[name]);
      if (isObject(res)) {
        params[name] = res;
      }
    };
    rules.map((name: string) => {
      try {
        // if a preprocess rule, execute it first
        if (PRE_PROCESS.hasOwnProperty(name)) {
          execute(
            name,
            PRE_PROCESS[name as keyof typeof PRE_PROCESS].bind(this),
          );
        }
        // execute the rule
        execute(name, ruleFns[name].bind(this));
        const index = keys.indexOf(name);
        if (index > -1) {
          keys.splice(index, 1);
        }
      } catch (e) {
        this.invalidKeys.push(`[(${name})${e.message}]`);
      }
    });
    // validate all params
    if (isFn(validator)) {
      this.validator(this.params);
    }
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
   * @param {TSuchInject} options
   * @returns
   * @memberof Mockit
   */
  private runModifiers(result: unknown, options: TSuchInject): unknown {
    const { params } = this;
    const { modifiers, modifierFns } = mockitsCache[this.constrName];
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
   * @param {TSuchInject} options
   * @returns
   * @memberof Mockit
   */
  private runFuncs(result: unknown, options: TSuchInject): unknown {
    const { $config, $func } = this.params;
    if ($func) {
      const { queue, params: fnsParams, fns } = $func as IPPFunc;
      for (let i = 0, j = queue.length; i < j; i++) {
        const name = queue[i];
        const fn = fns[i];
        const args: unknown[] = ((globalFns[name]
          ? [globalFns[name]]
          : []) as unknown[]).concat([
          fnsParams[i],
          globalVars,
          result,
          ($config as IPPConfig) || {},
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
   * @param {TSuchInject} options
   * @returns
   * @memberof Mockit
   */
  private runAll(result: unknown, options: TSuchInject): unknown {
    result = this.runModifiers(result, options);
    return this.runFuncs(result, options);
  }
}
// just for type check
export class BaseExtendMockit extends Mockit {
  init(): void {
    // nothing to do
  }
  test(): boolean {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(): any {
    // nothing to do
  }
}

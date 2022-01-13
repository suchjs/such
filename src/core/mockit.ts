import { TResult, TStrList, TObj, TConstructor } from '../types/common';
import { IPPConfig, IPPFunc, IPPFuncOptions } from '../types/parser';
import {
  deepCopy,
  getExpValue,
  hasOwn,
  isArray,
  isFn,
  isNoEmptyObject,
  isObject,
  typeOf,
} from '../helpers/utils';
import globalStore, { getNsStore } from '../data/store';
import {
  TMConfig,
  TMModifierFn,
  TMParams,
  TMAttrs,
  TMRuleFn,
  TMParamsValidFn,
  TMFactoryOptions,
  TMConfigRule,
} from '../types/mockit';
import { EnumSpecialType, TSuchInject } from '../types/instance';
import type { Such } from './such';
import { Variable } from '../data/config';
import { TFieldPath } from '../helpers/pathmap';

const { fns: globalFns, vars: globalVars } = globalStore;
// get namespace assigned values
const getNsValues = (
  callerNs: string,
  ownerNs: string,
): {
  nsFns: typeof globalFns;
  nsVars: typeof globalVars;
} => {
  const isCallerRoot = !callerNs;
  const isOwnerRoot = !ownerNs;
  // the root caller call itself
  if (isCallerRoot && isOwnerRoot) {
    return {
      nsFns: globalFns,
      nsVars: globalVars,
    };
  }
  // the none root caller call the root
  if (isOwnerRoot) {
    const { fns, vars } = getNsStore(callerNs);
    return {
      nsFns: {
        ...globalFns,
        ...fns,
      },
      nsVars: {
        ...globalVars,
        ...vars,
      },
    };
  }
  // now call the none root
  const store = getNsStore(ownerNs);
  const { fns, vars } = store.exports;
  if (isCallerRoot) {
    return {
      nsFns: {
        ...fns,
        ...globalFns,
      },
      nsVars: {
        ...vars,
        ...globalVars,
      },
    };
  }
  // none root caller call none root
  const callerStore = getNsStore(callerNs);
  return {
    nsFns: {
      ...globalFns,
      ...fns,
      ...callerStore.fns,
    },
    nsVars: {
      ...globalVars,
      ...vars,
      ...callerStore.vars,
    },
  };
};
// get namespace mockits cache
const getNsMockitsCache = (
  namespace?: string,
): typeof globalStore.mockitsCache => {
  if (!namespace) {
    return globalStore.mockitsCache;
  }
  const store = getNsStore(namespace);
  return store && store.mockitsCache;
};
// pre process data and methods
const { PRE_PROCESS, isPreProcessFn, setPreProcessFn } = (function () {
  const PRE_PROCESS_STAND = '__pre_process_fn__';
  const isPreProcessFn = (fn: (...args: unknown[]) => unknown): boolean => {
    return hasOwn((fn as unknown as TObj), PRE_PROCESS_STAND);
  };
  const setPreProcessFn = <T = (...args: unknown[]) => unknown>(fn: T): T => {
    (fn as unknown as TObj)[PRE_PROCESS_STAND] = true;
    return fn;
  };
  // mockit preprocessing
  const preFuncs = {
    $func: function (this: Mockit, $func: IPPFunc): IPPFunc {
      if (!$func) {
        return;
      }
      // validate params
      const { options } = $func;
      const { nsVars } = getNsValues(...this.getCurrentNs());
      for (let i = 0, j = options.length; i < j; i++) {
        const item: IPPFuncOptions = options[i];
        const { name, params } = item;
        params.map((param) => {
          // if object, valid
          if (param.variable) {
            try {
              if (typeof param.value === 'string') {
                if (param.value.includes('.') || param.value.includes('[')) {
                  new Function(
                    '__CONFIG__',
                    'return __CONFIG__.' + param.value,
                  )(nsVars);
                } else if (!hasOwn(nsVars, param.value)) {
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
    },
    $config: function (this: Mockit, $config: IPPConfig = {}): IPPConfig {
      const last: IPPConfig = {};
      const { nsVars } = getNsValues(...this.getCurrentNs());
      for (const key in $config) {
        if (hasOwn($config, key)) {
          const value = $config[key];
          if (value instanceof Variable) {
            const { name } = value;
            if (!hasOwn(nsVars, name)) {
              throw new Error(
                `The configuration of key "${key}" use a variable name "${name}" is not found in the assigned values, you need assign it first.`,
              );
            }
            last[key] = nsVars[name];
          } else {
            last[key] = value;
          }
        }
      }
      const { configOptions } = this.constructor as TStaticMockit;
      Object.keys(configOptions).map((key: string) => {
        const cur: TMConfigRule = configOptions[key];
        let def: unknown;
        let type: TConstructor | TConstructor[];
        const typeNames: TStrList = [];
        let validator = (target: unknown) => {
          const targetType = typeOf(target);
          const allTypes = isArray(type) ? type : [type];
          let flag = false;
          allTypes.map((cur) => {
            const curName = cur.name;
            typeNames.push(curName);
            if (!flag) {
              flag = targetType === curName;
            }
          });
          return flag;
        };
        const hasKey = hasOwn(last, key);
        if (isObject(cur)) {
          def = isFn(cur.default) ? cur.default() : cur.default;
          type = cur.type;
          validator = isFn<typeof validator>(cur.validator)
            ? cur.validator
            : validator;
        }
        if (!hasKey) {
          // set default
          if (def !== undefined) {
            last[key] = def;
          }
        } else {
          if (!validator.call(this, last[key])) {
            throw new Error(
              `the config of "${key}"'s value ${
                last[key]
              } is not instance of ${typeNames.join(',')}`,
            );
          }
        }
      });
      return last;
    },
  };
  return {
    PRE_PROCESS: preFuncs,
    isPreProcessFn,
    setPreProcessFn,
  };
})();
export type TStaticMockit = typeof Mockit;
type TPartStaticMockit = Partial<TStaticMockit>;
/**
 * abstrct class Mockit
 * @export
 * @abstract
 * @class Mockit
 * @template T
 */
export default abstract class Mockit<T = unknown> {
  // chain names
  public static chainNames: string[] = [];
  // constructor name, for cache
  public static readonly constrName: string;
  // namespace
  public static readonly namespace?: string;
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // special type
  public static readonly specialType: EnumSpecialType;
  // if config options is set, will allow configuration `data attribute`
  public static configOptions: TMConfig = {};
  // self config options
  public static selfConfigOptions: TMConfig = {};
  // validate all params
  public static validator: TMParamsValidFn;
  // params
  public params: TMParams = {};
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
  constructor(
    protected readonly callerNamespace?: string,
    protected readonly path?: TFieldPath,
  ) {
    const { namespace, constrName, configOptions } = this.getStaticProps();
    const mockitsCache = getNsMockitsCache(namespace);
    // init only once
    if (mockitsCache[constrName]) {
      const { define } = mockitsCache[constrName];
      if (isObject(define)) {
        Object.keys(define).map((key: keyof TMFactoryOptions) => {
          const value = define[key];
          // force to add defines
          const self = this as unknown as TObj;
          if (typeOf(value) === 'Object') {
            self[key] = deepCopy({}, value);
          } else {
            self[key] = value;
          }
        });
      }
    } else {
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
      if (isNoEmptyObject(configOptions)) {
        this.addRule(
          '$config',
          setPreProcessFn(PRE_PROCESS.$config.bind(this)),
        );
      }
      // cached the mockit, frozen all data
      this.frozen();
    }
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
    // reset the validate info
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
    const { allowAttrs } = this.constructor as TStaticMockit;
    names.forEach((name) => {
      if (!allowAttrs.includes(name)) {
        allowAttrs.push(name);
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
    const { params, initParams, generate } = this;
    const { namespace, constrName } = this.getStaticProps();
    const mockitsCache = getNsMockitsCache(namespace);
    mockitsCache[constrName].define = deepCopy(
      {},
      {
        params,
        initParams,
        generate,
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
    fn?: (options?: TSuchInject, such?: Such) => TResult<T>,
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
  public make(options: TSuchInject, such: Such): unknown {
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
  public abstract generate(options: TSuchInject, such: Such): TResult<T>;
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
    const { namespace, constrName } = this.getStaticProps();
    const curName = constrName;
    const mockitsCache = getNsMockitsCache(namespace);
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
      if (hasOwn(PRE_PROCESS, name)) {
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
   * @returns
   */
  public getStaticProps(): TPartStaticMockit {
    const staticMockit = this.constructor as TStaticMockit;
    const {
      constrName,
      namespace,
      validator,
      allowAttrs,
      configOptions,
      selfConfigOptions,
      specialType,
    } = staticMockit;
    return {
      constrName,
      namespace,
      validator,
      allowAttrs,
      configOptions,
      selfConfigOptions,
      specialType,
    };
  }
  /**
   * return current namespace
   * @returns [string]
   */
  protected getCurrentNs(): [string, string] {
    return [this.callerNamespace, this.getStaticProps().namespace];
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private validParams(): boolean {
    const { params } = this;
    const { namespace, constrName, validator } = this.getStaticProps();
    const mockitsCache = getNsMockitsCache(namespace);
    const { rules, ruleFns } = mockitsCache[constrName];
    const keys = Object.keys(params);
    const execute = function (
      name: string,
      cb: TMRuleFn<unknown>,
      cacheName?: string,
    ) {
      const transformedKey = cacheName || '__TRANSFORMED__';
      // if the rule name has ever validated, ignore this rule
      if (
        isObject(params[name]) &&
        hasOwn(params[name], transformedKey)
      ) {
        return;
      }
      // validate the rule
      const res = cb.call(this, params[name]);
      // if the rule return an object, override the original value by the return result
      // set the rule as an ever validated rule
      if (isObject(res)) {
        res[transformedKey] = true;
        params[name] = res;
      }
    };
    rules.map((name: string) => {
      try {
        // if a preprocess rule, execute it first
        if (hasOwn(PRE_PROCESS, name)) {
          execute(
            name,
            PRE_PROCESS[name as keyof typeof PRE_PROCESS].bind(this),
            `__${name}__`,
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
      validator(this.params);
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
    const { namespace, constrName } = this.getStaticProps();
    const mockitsCache = getNsMockitsCache(namespace);
    const { modifiers, modifierFns } = mockitsCache[constrName];
    for (let i = 0, j = modifiers.length; i < j; i++) {
      const name = modifiers[i];
      if (hasOwn(params, name)) {
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
    const { nsFns, nsVars } = getNsValues(...this.getCurrentNs());
    if ($func) {
      const { queue, params: fnsParams, fns } = $func as IPPFunc;
      for (let i = 0, j = queue.length; i < j; i++) {
        const name = queue[i];
        const fn = fns[i];
        const isUserDefined = hasOwn(nsFns, name);
        const args: unknown[] = (
          (isUserDefined ? [nsFns[name]] : []) as unknown[]
        ).concat([
          fnsParams[i],
          nsVars,
          result,
          ($config as IPPConfig) || {},
          getExpValue,
        ]);
        result = fn(isUserDefined).apply(options, args);
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

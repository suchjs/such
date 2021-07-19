import { TConstructor, TResult, TStrList, TObj } from '../types/common';
import { IPPConfig, IPPFunc, IPPFuncOptions } from '../types/parser';
import {
  deepCopy,
  getExpValue,
  isArray,
  isFn,
  isNoEmptyObject,
  isObject,
  typeOf,
} from '../helpers/utils';
import store from '../data/store';
import {
  TMConfig,
  TMConfigRule,
  TMModifierFn,
  TMParams,
  TMRuleFn,
} from '../types/mockit';
import { TSuchInject } from '../types/instance';
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
  protected configOptions: TMConfig = {};
  protected origParams: TMParams = {};
  protected generateFn: undefined | ((options: TSuchInject) => TResult<T>);
  protected isValidOk = false;
  protected hasValid = false;
  protected invalidKeys: TStrList = [];
  protected readonly constrName = this.constructor.name;
  /**
   * create an instance of Mockit.
   * 构造函数
   * @memberof Mockit
   */
  constructor() {
    const className = this.constrName;
    if (mockitsCache[className]) {
      const { define } = mockitsCache[className];
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
    mockitsCache[className] = {
      rules: [],
      ruleFns: {},
      modifiers: [],
      modifierFns: {},
    };
    this.init();
    // all type support modifiers
    this.addRule('$func', function ($func: IPPFunc) {
      if (!$func) {
        return;
      }
      const options = $func.options;
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
      this.addRule('$config', function ($config: IPPConfig = {}) {
        const last = deepCopy({}, $config) as IPPConfig;
        Object.keys(configOptions).map((key: string) => {
          const cur: TMConfigRule = configOptions[key];
          let required = false;
          let def: unknown;
          let type: TConstructor | TConstructor[];
          const typeNames: TStrList = [];
          let validator = (target: unknown) => {
            const targetType = typeOf(target);
            const allTypes = isArray(type) ? type : [type];
            let flag = false;
            allTypes.map((Cur) => {
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
            throw new Error(`${className} required set config "${key}"`);
          } else if (hasKey && !validator.call(null, last[key])) {
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
   * @readonly
   * @protected
   * @type {string}
   * @memberof Mockit
   */
  protected get className(): string {
    return this.constrName || this.constructor.name;
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
  public setParams(params: TObj, value?: undefined): TObj | never;
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
    const { params, origParams, generateFn, configOptions } = this;
    mockitsCache[this.className].define = deepCopy(
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
  public reGenerate(fn?: (options: TSuchInject) => TResult<T>): void {
    this.generateFn = fn;
  }
  /**
   *
   *
   * @param {TObj} [Such]
   * @returns {TResult<T>}
   * @memberof Mockit
   */
  public make(options: TSuchInject): unknown {
    this.validate();
    const result = isFn(this.generateFn)
      ? this.generateFn.call(this, options)
      : this.generate(options);
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
  public abstract generate(options: TSuchInject): TResult<T>;
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
    const curName = this.className;
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
    const { rules, ruleFns } = mockitsCache[this.className];
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
   * @param {TSuchInject} options
   * @returns
   * @memberof Mockit
   */
  private runModifiers(result: unknown, options: TSuchInject): unknown {
    const { params } = this;
    const { modifiers, modifierFns } = mockitsCache[this.className];
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

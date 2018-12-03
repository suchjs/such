import { deepCopy, getExpValue, isFn, isNoEmptyObject, isPromise, typeOf, withPromise } from '../helpers/utils';
import store from '../store';
import {
  MockitConfig, MockitConfigItem, NormalObject, ParamsFunc,
  ParamsFuncOptions, SuchOptions, TypeContructor,
} from '../types';
const { fns: globalFns, vars: globalVars, mockits } = store;
//
export type Result<T> = T | never;
export type ModifierFn<T> = (res: T) => T | string | never;
export type RuleFn = (cur: NormalObject) => void | NormalObject;

export default abstract class Mockit<T> {
  protected configOptions: MockitConfig = {};
  protected params: NormalObject = {};
  protected origParams: NormalObject = {};
  protected generateFn: undefined | ((options: SuchOptions) => Result<T>);
  protected isValidOk: boolean = false;
  protected hasValid: boolean = false;
  protected invalidKeys: string[] = [];
  /**
   * Creates an instance of Mockit.
   * @memberof Mockit
   */
  constructor(protected readonly constructorName: string) {
    const constrName = constructorName || this.constructor.name;
    if(mockits[constrName]) {
      const { define } = mockits[constrName];
      if(typeOf(define) === 'Object') {
        Object.keys(define).map((key) => {
          const value = define[key];
          if(typeOf(value) === 'Object') {
            (this as NormalObject)[key] = deepCopy({}, value);
          } else {
            (this as NormalObject)[key] = value;
          }
        });
      }
      return;
    }
    mockits[constrName] = {
      rules: [],
      ruleFns: {},
      modifiers: [],
      modifierFns: {},
    };
    this.init();
    // all type support modifiers
    this.addRule('Func', function(Func: ParamsFunc) {
      if(!Func) {
        return;
      }
      const options = Func.options;
      for(let i = 0, j = options.length; i < j; i++) {
        const item: ParamsFuncOptions = options[i];
        const { name, params } = item;
        params.map((param) => {
          // if object,valid
          if(param.variable) {
            try {
              if((param.value.indexOf('.') > -1 || param.value.indexOf('[') > -1)) {
                new Function('__CONFIG__', 'return __CONFIG__.' + param.value)(globalVars);
              } else if(!globalVars.hasOwnProperty(param.value)) {
                throw new Error(`"${param.value} is not assigned."`);
              }
            } catch(e) {
              throw new Error(`the modifier function ${name}'s param ${param.value} is not correct:${e.message}`);
            }
          }
        });
      }
    });
    const { configOptions } = this;
    // if set configOptions,validate config
    if(isNoEmptyObject(configOptions)) {
      this.addRule('Config', function(Config: NormalObject) {
          const last = deepCopy({}, Config || {});
          Object.keys(configOptions).map((key: string) => {
            const cur: MockitConfigItem<any> = configOptions[key];
            let required = false;
            let def: any;
            let type: TypeContructor | TypeContructor[];
            const typeNames: string[] = [];
            let validator = (target: any) => {
              const targetType = typeOf(target);
              const allTypes = typeOf(type) === 'Array' ? type : [type];
              let flag = false;
              (allTypes as TypeContructor[]).map((Cur) => {
                const curName = Cur.name;
                typeNames.push(curName);
                if(!flag) {
                  flag = targetType === curName;
                }
              });
              return flag;
            };
            const hasKey = last.hasOwnProperty(key);
            if(typeOf(cur) === 'Object') {
              required = !!cur.required;
              def = isFn(cur.default) ? cur.default() : cur.default;
              type = cur.type;
              validator = isFn(cur.validator) ? cur.validator : validator;
            }
            if(required && !hasKey) {
              throw new Error(`${constrName} required set config "${key}"`);
            } else if(hasKey && !validator.call(null, last[key])) {
              // tslint:disable-next-line:max-line-length
              throw new Error(`the config of "${key}"'s value ${last[key]} is not instance of ${typeNames.join(',')}`);
            } else {
              if(!hasKey && def !== undefined) {
                last[key] = def;
              }
            }
          });
          return last;
      });
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
   * @param {ModifierFn<T>} fn
   * @param {string} [pos]
   * @returns
   * @memberof Mockit
   */
  public addModifier(name: string, fn: ModifierFn<T>, pos?: string) {
    return this.add('modifier', name, fn, pos);
  }
  /**
   *
   *
   * @param {string} name
   * @param {RuleFn} fn
   * @param {string} [pos]
   * @returns
   * @memberof Mockit
   */
  public addRule(name: string, fn: RuleFn, pos?: string) {
    return this.add('rule', name, fn, pos);
  }
  /**
   *
   *
   * @param {NormalObject} params
   * @param {undefined} value
   * @returns {(NormalObject|never)}
   * @memberof Mockit
   */
  public setParams(params: NormalObject, value: undefined): NormalObject | never;
  public setParams(key: string, value: NormalObject): NormalObject | never;
  public setParams(key: any, value: any): NormalObject | never {
    let params: NormalObject = {};
    if (typeof key === 'object' && value === undefined) {
      params = key;
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
  public frozen() {
    // frozen params for extend type.
    const constrName = this.constructorName || this.constructor.name;
    const { params, origParams, generateFn, configOptions } = this;
    mockits[constrName].define = deepCopy({}, {
      params,
      origParams,
      configOptions,
      generateFn,
    });
    return this;
  }
  /**
   *
   *
   * @param {() => Result<T>} [fn]
   * @memberof Mockit
   */
  public reGenerate(fn?: (options: SuchOptions) => Result<T>) {
    this.generateFn = fn;
  }
  /**
   *
   *
   * @param {NormalObject} [Such]
   * @returns {Result<T>}
   * @memberof Mockit
   */
  public make(options: SuchOptions): Result<T> {
    this.validate();
    // tslint:disable-next-line:max-line-length
    let result = typeof this.generateFn === 'function' ? this.generateFn.call(this, options) : this.generate(options);
    let isPromRes = isPromise(result);
    if(!isPromRes && typeOf(result) === 'Array') {
      result = withPromise(result);
      isPromRes = isPromise(result[0]);
      if(isPromRes) {
        result = Promise.all(result);
      }
    }
    // judge if promise
    return isPromRes ? result.then((res: any) => {
      return this.runAll(res, options);
    }) : this.runAll(result, options);
  }
  /**
   *
   *
   * @abstract
   * @returns {Result<T>}
   * @memberof Mockit
   */
  public abstract generate(options: SuchOptions): Result<T>;
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
   * @param {(RuleFn|ModifierFn<T>)} fn
   * @param {string} [pos]
   * @returns {(never|void)}
   * @memberof Mockit
   */
  private add(type: 'rule' | 'modifier', name: string,  fn: RuleFn | ModifierFn<T>, pos?: string): never | void {
    const curName = this.constructorName || this.constructor.name;
    const { rules, ruleFns, modifiers, modifierFns } = mockits[curName];
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
    const { rules, ruleFns } = mockits[this.constructorName || this.constructor.name];
    const keys = Object.keys(params);
    rules.map((name: string) => {
      try {
        const res = ruleFns[name].call(this, params[name]);
        if (typeof res === 'object') {
          this.params[name] = res;
        }
        const index = keys.indexOf(name);
        if(index > -1) {
          keys.splice(index, 1);
        }
      } catch (e) {
        this.invalidKeys.push(`[(${name})${e.message}]`);
      }
    });
    if(keys.length) {
      // tslint:disable-next-line:no-console
      console.warn(`the params of keys:${keys.join(',')} has no valid rule.`);
    }
    return this.invalidKeys.length === 0;
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private validate() {
    const { invalidKeys } = this;
    if(!this.hasValid) {
      this.isValidOk = this.validParams();
      this.hasValid = true;
    }
    if(!this.isValidOk) {
      throw new Error(`invalid params:${invalidKeys.join(',')}`);
    }
  }
  /**
   *
   *
   * @private
   * @memberof Mockit
   */
  private resetValidInfo() {
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
  private runModifiers(result: any, options: SuchOptions) {
    const { params } = this;
    const { modifiers, modifierFns } = mockits[this.constructorName || this.constructor.name];
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
  private runFuncs(result: any, options: SuchOptions) {
    const { Config, Func } = this.params;
    if(Func) {
      const { queue, params: fnsParams, fns } = Func;
      for(let i = 0, j = queue.length; i < j; i++) {
        const name = queue[i];
        const fn = fns[i];
        // tslint:disable-next-line:max-line-length
        const args = (globalFns[name] ? [globalFns[name]] : [] ).concat([fnsParams[i], globalVars, result, Config || {}, getExpValue]);
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
  private runAll(result: any, options: SuchOptions) {
    result = this.runModifiers(result, options);
    return this.runFuncs(result, options);
  }
}

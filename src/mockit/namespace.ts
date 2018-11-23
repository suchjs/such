import store from '../store';
import { NormalObject, ParamsFunc, ParamsFuncItem } from '../types';
const { fns: globalFns, vars: globalVars, mockits } = store;
//
export type Result<T> = T | never;
export type ModifierFn<T> = (res: T) => T | string | never;
export type RuleFn = (cur: NormalObject) => void | NormalObject;
export default abstract class Mockit<T> {
  protected userFns: NormalObject = [];
  protected userFnQueue: string[] = [];
  protected userFnParams: NormalObject = {};
  protected params: NormalObject = {};
  protected generateFn: undefined | (() => Result<T>);
  protected ignoreRules: string[] = [];
  /**
   * Creates an instance of Mockit.
   * @memberof Mockit
   */
  constructor(protected readonly constructorName: string) {
    const constrName = constructorName || this.constructor.name;
    if(mockits[constrName]) {
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
      for(let i = 0, j = Func.length; i < j; i++) {
        const item: ParamsFuncItem = Func[i];
        const { name } = item;
        const fn = globalFns[name];
        if(!fn) {
          throw new Error(`the "Func" params used undefined function "${item.name}"`);
        }
      }
    });
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
    const { rules, ruleFns } = mockits[this.constructorName || this.constructor.name];
    const keys = Object.keys(params);
    (keys.length > 1 ? keys.sort((a: string, b: string) => {
      return rules.indexOf(a) < rules.indexOf(b) ? 1 : -1;
    }) : keys).map((name: string) => {
      if (rules.indexOf(name) > -1) {
        try {
          const res = ruleFns[name].call(this, params[name]);
          if(name === 'Func') {
            this.parseFuncParams(params[name]);
          }
          if (typeof res === 'object') {
            this.params[name] = res;
          } else {
            this.params[name] = params[name];
          }
        } catch (e) {
          throw e;
        }
      } else {
        throw new Error(`Unsupported param (${name})`);
      }
    });
    return params;
  }
  /**
   *
   *
   * @param {() => Result<T>} [fn]
   * @memberof Mockit
   */
  public reGenerate(fn?: () => Result<T>) {
    this.generateFn = fn;
  }
  /**
   *
   *
   * @param {NormalObject} [Such]
   * @returns {Result<T>}
   * @memberof Mockit
   */
  public make(Such?: NormalObject): Result<T> {
    const { modifiers, modifierFns } = mockits[this.constructorName || this.constructor.name];
    const { params, userFnQueue, userFns, userFnParams } = this;
    let result = typeof this.generateFn === 'function' ? this.generateFn.call(this) : this.generate();
    let i;
    let j = modifiers.length;
    for (i = 0; i < j; i++) {
      const name = modifiers[i];
      if (params.hasOwnProperty(name)) {
        const fn = modifierFns[name];
        const args = [result, params[name]];
        if (fn.length === 3) {
          args.push(Such);
        }
        result = fn.apply(this, args);
      }
    }
    const { Config } = this.params;
    for(i = 0, j = userFnQueue.length; i < j; i++) {
      const name = userFnQueue[i];
      const fn = userFns[name];
      result = fn.apply(null, [ result, Config || {}, globalVars, globalFns[name], userFnParams[name]]);
    }

    return result;
  }
  /**
   *
   *
   * @abstract
   * @returns {Result<T>}
   * @memberof Mockit
   */
  public abstract generate(): Result<T>;
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
   * @protected
   * @param {ParamsFunc} Func
   * @memberof Mockit
   */
  protected parseFuncParams(Func: ParamsFunc) {
    this.userFnQueue = [];
    for(let i = 0, j = Func.length; i < j; i++) {
      const { name, params } = Func[i];
      const confName = '__CONFIG__';
      const varName = '__VARS__';
      const argName = '__ARGS__';
      const fnName = '__FN__';
      const resName = '__RESULT__';
      const lastParams: string[] = [resName];
      const paramValues: any[] = [];
      let index: number = 0;
      params.forEach((param) => {
        const { value, variable } = param;
        if(variable) {
          // tslint:disable-next-line:max-line-length
          lastParams.push(`${confName}.hasOwnProperty("${value}") ? ${confName}["${value}"] : ${varName}["${value}"]`);
        } else {
          paramValues.push(value);
          lastParams.push(`${argName}[${index++}]`);
        }
      });
      this.userFnQueue.push(name);
      // tslint:disable-next-line:max-line-length
      this.userFns[name] = new Function([resName, confName, varName, fnName, argName].join(','), `return ${fnName}(${lastParams.join(',')});`);
      this.userFnParams[name] = paramValues;
    }
  }
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
    // ignore not needed rules
    if (this.ignoreRules.indexOf(name) > -1) {
      return;
    }
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
}

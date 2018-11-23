import { suchRule } from './config';
import { capitalize, isFn, isOptional, makeRandom, map, typeOf } from './helpers/utils';
import * as mockitList from './mockit';
import Mockit from './mockit/namespace';
import Parser from './parser';
import store from './store';
import { NormalObject } from './types';
/**
 *
 *
 * @interface SuchConfig
 */
export interface SuchConfig {
  instance?: boolean;
  config?: KeyRuleInterface;
}
/**
 *
 *
 * @interface KeyRuleInterface
 */
export interface KeyRuleInterface {
  min?: number;
  max?: number;
  optional?: boolean;
  oneOf?: boolean;
  alwaysArray?: boolean;
}
/**
 *
 *
 * @interface MockitInstances
 */
export interface MockitInstances {
  [index: string]: any;
}
/**
 *
 *
 * @interface MockerOptions
 */
export interface MockerOptions {
  target: any;
  xpath: Array<string | number>;
  parent?: Mocker;
  config?: KeyRuleInterface;
}
/**
 *
 *
 * @interface MockitOptions
 */
export interface MockitOptions {
  param: string;
  ignoreRules?: string[];
  init?: () => void;
  generate?: () => any;
  generateFn?: () => void;
}

export type Xpath = Array<string | number>;

// all mockits
const AllMockits: NormalObject = {};
map(mockitList, (item, key) => {
  if ((key as string).indexOf('_') === 0) {
    return;
  }
  AllMockits[key] = item;
});
/**
 *
 *
 * @class ArrKeyMap
 * @template T
 */
export class ArrKeyMap<T> {
  private hashs: {[index: string]: T} = {};
  private keyHashs: {[index: string]: Xpath} = {};
  private rootKey: string = '__ROOT__';
  /**
   *
   *
   * @param {Xpath} key
   * @param {T} value
   * @returns
   * @memberof ArrKeyMap
   */
  public set(key: Xpath, value: T) {
    const saveKey = this.buildKey(key);
    this.hashs[saveKey] = value;
    this.keyHashs[saveKey] = key;
    return this;
  }
  /**
   *
   *
   * @param {Xpath} key
   * @returns {T}
   * @memberof ArrKeyMap
   */
  public get(key: Xpath): T {
    return this.hashs[this.buildKey(key)];
  }
  /**
   *
   *
   * @memberof ArrKeyMap
   */
  public clear() {
    this.hashs = {};
    this.keyHashs = {};
  }
  /**
   *
   *
   * @private
   * @param {Xpath} key
   * @returns
   * @memberof ArrKeyMap
   */
  private buildKey(key: Xpath) {
    return key.reduce((prev, next) => {
      return prev + '["' + ('' + next).replace(/"/g, '\\"') + '"]';
    }, this.rootKey);
  }
}
/**
 *
 *
 * @class Mocker
 */
// tslint:disable-next-line:max-classes-per-file
export class Mocker {
  /**
   *
   *
   * @static
   * @param {string} key
   * @returns
   * @memberof Mocker
   */
  public static parseKey(key: string) {
    const rule = /(\??)(:?)(?:\{(\d+)(?:,(\d+))?}|\[(\d+)(?:,(\d+))?])?$/;
    let match: any[];
    const config: NormalObject = {};
    if ((match = key.match(rule)).length && match[0] !== '') {
      const [all, query, colon, lMin, lMax, aMin, aMax] = match;
      const hasArrLen = aMin !== undefined;
      const hasNormalLen = lMin !== undefined;
      config.optional = query === '?';
      config.oneOf = colon === ':';
      config.alwaysArray = hasArrLen;
      if (hasNormalLen || hasArrLen) {
        const min = hasNormalLen ? lMin : aMin;
        let max = hasNormalLen ? lMax : aMax;
        if (max === undefined) {
          max = min;
        }
        if (Number(max) < Number(min)) {
          throw new Error(`the max of ${max} is less than ${min}`);
        }
        config.min = Number(min);
        config.max = Number(max);
      } else if (config.oneOf) {
        config.min = config.max = 1;
      }
      key = key.slice(0, -all.length);
    }
    return {
      key,
      config,
    };
  }
  public readonly target: any;
  public readonly config: NormalObject = {};
  public readonly xpath: Xpath;
  public readonly type: string;
  public readonly instances?: ArrKeyMap<Mocker>;
  public readonly datas?: ArrKeyMap<any>;
  public readonly root: Mocker;
  public readonly parent: Mocker;
  public readonly dataType: string;
  public readonly isRoot: boolean;
  public readonly mockFn: (dpath: Xpath) => any;
  public readonly mockit: NormalObject;
  /**
   * Creates an instance of Mocker.
   * @param {MockerOptions} options
   * @param {ArrKeyMap<Mocker>} [rootInstances]
   * @param {ArrKeyMap<any>} [rootDatas]
   * @memberof Mocker
   */
  constructor(options: MockerOptions, rootInstances?: ArrKeyMap<Mocker>, rootDatas?: ArrKeyMap<any>) {
    const {target, xpath, config, parent} = options;
    this.target = target;
    this.xpath = xpath;
    this.config = config || {};
    this.isRoot = xpath.length === 0;
    if (this.isRoot) {
      this.instances = rootInstances;
      this.datas = rootDatas;
      this.root = this;
      this.parent = this;
    } else {
      this.parent = parent;
      this.root = parent.root;
    }
    const dataType = typeOf(this.target).toLowerCase();
    const { min, max, oneOf, alwaysArray } = this.config;
    const { instances, datas } = this.root;
    const hasLength = !isNaN(min);
    this.dataType = dataType;
    if (dataType === 'array') {
      const getInstance = (index?: number): Mocker => {
        const mIndex = !isNaN(index) ? index : makeRandom(0, target.length - 1);
        const nowXpath = xpath.concat(mIndex);
        let instance = instances.get(nowXpath);
        if (!(instance instanceof Mocker)) {
          instance = new Mocker({
            target: target[mIndex],
            xpath: nowXpath,
            parent: this,
          });
          instances.set(nowXpath, instance);
        }
        return instance;
      };
      if (!hasLength) {
        // e.g {"a":["b","c"]}
        const mockers = target.map((item: any, index: number) => {
          return getInstance(index);
        });
        this.mockFn = (dpath) => {
          const result: any[] = [];
          mockers.map((instance: Mocker, index: number) => {
            const nowDpath = xpath.concat(index);
            const value = instance.mock(nowDpath);
            result[index] = value;
            datas.set(nowDpath, value);
          });
          return result;
        };
      } else {
        const makeArrFn = (dpath: Xpath, instance: Mocker | Mocker[], total?: number) => {
          const result: any[] = [];
          // tslint:disable-next-line:max-line-length
          const makeInstance = instance instanceof Mocker ? (i: number) => instance as Mocker : (i: number) => (instance as Mocker[])[i];
          total = !isNaN(total) ? total : makeRandom(min, max);
          for (let i = 0; i < total; i++) {
            const nowDpath = dpath.concat(i);
            const value = makeInstance(i).mock(nowDpath);
            result[i] = value;
            datas.set(nowDpath, value);
          }
          return result;
        };
        const makeOptional = (dpath: Xpath, instance: Mocker, total: number): never | any => {
          let result;
          if (total > 1) {
            throw new Error(`optional func of the total param can not more than 1`);
          } else if (total === 1) {
            result = instance.mock(dpath);
          }
          datas.set(dpath, result);
          return result;
        };
        let resultFn: (dpath: Xpath, instance: Mocker) => any;
        if (oneOf) {
          if (alwaysArray) {
            // e.g {"a:[0,1]":[{b:1},{"c":1},{"d":1}]}
            resultFn = makeArrFn;
          } else {
            // e.g {"a:{0,5}":["amd","cmd","umd"]}
            resultFn = (dpath, instance) => {
              const total = makeRandom(min, max);
              if (total <= 1) {return makeOptional(dpath, instance, total); }
              return makeArrFn(dpath, instance, total);
            };
          }
          this.mockFn = (dpath) => {
            const instance = getInstance();
            return resultFn(dpath, instance);
          };
        } else {
          // e.g {"a[1,3]":["amd","cmd","umd"]}
          // e.g {"a{0,3}":["amd","cmd","umd"]}
          const makeRandArrFn = (dpath: Xpath, total?: number) => {
            total = !isNaN(total) ? total : makeRandom(min, max);
            const targets = Array.apply(null, new Array(total)).map(() => {
              return getInstance();
            });
            return makeArrFn(dpath, targets, total);
          };
          if (alwaysArray || min > 1) {
            this.mockFn = (dpath) => {
              return makeRandArrFn(dpath);
            };
          } else {
            this.mockFn = (dpath) => {
              const total = makeRandom(min, max);
              if (total <= 1) {return makeOptional(dpath, getInstance(), total); }
              return makeRandArrFn(dpath, total);
            };
          }
        }
      }
    } else if (dataType === 'object') {
      // parse key
      const keys: NormalObject[] = [];
      for (const i in target) {
        if (target.hasOwnProperty(i)) {
          const val = target[i];
          const {key, config: conf} = Mocker.parseKey(i);
          keys.push({
            key,
            target: val,
            config: conf,
          });
        }
      }
      this.mockFn = (dpath) => {
        const result: NormalObject = {};
        const prevXpath = this.xpath;
        keys.map((item) => {
          const { key, config: conf, target: tar } = item;
          const { optional } = conf;
          const nowXpath = prevXpath.concat(key);
          const nowDpath = dpath.concat(key);
          if (optional && isOptional()) {
            // do nothing
          } else {
            let instance = instances.get(nowXpath);
            if (!(instance instanceof Mocker)) {
              instance = new Mocker({
                target: tar,
                config: conf,
                xpath: nowXpath,
                parent: this,
              });
              instances.set(nowXpath, instance);
            }
            const value = instance.mock(dpath.concat(key));
            result[key] = value;
            datas.set(nowDpath, value);
          }
        });
        return result;
      };
    } else {
      let match;
      if (dataType === 'string' && (match = target.match(suchRule)) && AllMockits.hasOwnProperty(match[1])) {
        this.type = match[1];
        const klass = AllMockits[match[1]];
        const instance = new klass();
        const meta = target.replace(match[0], '').replace(/^\s*:\s*/, '');
        if (meta !== '') {
          const params = Parser.parse(meta);
          instance.setParams(params);
        }
        this.mockit = instance;
        this.mockFn = () => instance.make(Such);
      } else {
        this.mockFn = () => target;
      }
    }
  }

  /**
   *
   *
   * @param {*} value
   * @memberof Mocker
   */
  public setParams(value: string | NormalObject) {
    if (this.mockit) {
      return this.mockit.setParams(typeof value === 'string' ? Parser.parse(value) : value);
    } else {
      throw new Error('This mocker is not the mockit type.');
    }
  }
  /**
   *
   *
   * @param {Xpath} [dpath]
   * @returns
   * @memberof Mocker
   */
  public mock(dpath?: Xpath) {
    const {optional} = this.config;
    dpath = this.isRoot ? [] : dpath;
    if (this.isRoot && optional && isOptional()) {
      return;
    }
    return this.mockFn(dpath);
  }
}
/**
 *
 *
 * @export
 * @class Such
 */
// tslint:disable-next-line:max-classes-per-file
export default class Such {
  /**
   *
   *
   * @static
   * @param {*} target
   * @memberof Such
   */
  public static as(target: any, options?: SuchConfig) {
    const ret = new Such(target, options);
    return options && options.instance ? ret : ret.a();
  }
  /**
   *
   *
   * @static
   * @param {string} name
   * @param {*} value
   * @memberof Such
   */
  public static assign(name: string, value: any, alwaysVar: boolean = false) {
    store(name, value, alwaysVar);
  }
  /**
   *
   *
   * @static
   * @param {string} type
   * @param {string} fromType
   * @param {(string|MockitOptions)} options
   * @memberof Such
   */
  public static define(type: string, ...args: any[]): void | never {
    const argsNum = args.length;
    if(argsNum === 0 || argsNum > 2) {
      throw new Error(`the static "define" method's arguments is not right.`);
    }
    const opts = args.pop();
    // tslint:disable-next-line:max-line-length
    const config: MockitOptions = argsNum === 2 && typeof opts === 'string' ? ({ param: opts } as MockitOptions) : (argsNum === 1 && typeof opts === 'function' ? { generate: opts } : opts);
    const { param, init, generateFn, generate, ignoreRules } = config;
    const params = typeof param === 'string' ? Parser.parse(param) : {};
    const constrName = `To${capitalize(type)}`;
    if (!AllMockits.hasOwnProperty(type)) {
      // tslint:disable-next-line:max-line-length
      let klass;
      const utils = { isOptional, makeRandom };
      if(argsNum === 2) {
        const baseType = args[0];
        const base = AllMockits[baseType as string];
        if(!base) {
          throw new Error(`the defined type "${type}" what based on type of "${baseType}" is not exists.`);
        }
        // tslint:disable-next-line:max-classes-per-file
        klass = class extends (base as {new(name: string): any}) {
          constructor() {
            super(constrName);
            this.ignoreRules = ignoreRules || [];
            this.setParams(params);
          }
          public init() {
            super.init();
            if (isFn(init)) {
              init.call(this);
            }
            if (isFn(generateFn)) {
              this.reGenerate(generateFn);
            }
          }
        };
      } else {
        // tslint:disable-next-line:max-classes-per-file
        klass = class extends Mockit<any> {
          constructor() {
            super(constrName);
            this.ignoreRules = ignoreRules || [];
            this.setParams(params, undefined);
          }
          public init() {
            if(isFn(init)) {
              init.call(this);
            }
          }
          public generate() {
            return generate.call(this, utils);
          }
          public test() {
            return true;
          }
        };
      }
      AllMockits[type] = klass;
    } else {
      throw new Error(`the type "${type}" has been defined yet.`);
    }
  }
  public readonly target: any;
  public readonly options: SuchConfig;
  public readonly mocker: Mocker;
  public readonly instances: ArrKeyMap<Mocker>;
  public readonly datas: ArrKeyMap<any>;
  protected struct: NormalObject;
  private initail: boolean = false;
  constructor(target: any, options?: SuchConfig) {
    this.target = target;
    this.instances = new ArrKeyMap();
    this.datas = new ArrKeyMap();
    this.mocker = new Mocker({
      target,
      xpath: [],
      config: options && options.config,
    }, this.instances, this.datas);
  }
  /**
   *
   *
   * @returns
   * @memberof Such
   */
  public a() {
    if (!this.initail) {
      this.initail = true;
    } else {
      this.datas.clear();
    }
    return this.mocker.mock();
  }

}

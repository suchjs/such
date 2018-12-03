import { suchRule } from './config';
import PathMap, { Path } from './helpers/pathmap';
import * as utils from './helpers/utils';
import * as mockitList from './mockit';
import Mockit from './mockit/namespace';
import Parser from './parser';
import store from './store';
import { MockitOptions, NormalObject, ParserConfig, SuchConfFile, SuchOptions } from './types';
const { capitalize, isFn, isOptional, makeRandom, map, typeOf, deepCopy, isNoEmptyObject } = utils;
const { alias, aliasTypes } = store;
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
 * @export
 * @interface MockerOptions
 */
export interface MockerOptions {
  target: any;
  path: Path;
  parent?: Mocker;
  config?: KeyRuleInterface;
}
//
export interface PromiseResult {
  dpath: Path;
  result: Promise<any>;
}
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
  public readonly path: Path;
  public readonly type: string;
  public readonly instances?: PathMap<Mocker>;
  public readonly datas?: PathMap<any>;
  public readonly root: Mocker;
  public readonly parent: Mocker;
  public readonly dataType: string;
  public readonly isRoot: boolean;
  public readonly mockFn: (dpath: Path) => any;
  public readonly mockit: NormalObject;
  public readonly promises: PromiseResult[] = [];
  /**
   * Creates an instance of Mocker.
   * @param {MockerOptions} options
   * @param {PathMap<Mocker>} [rootInstances]
   * @param {PathMap<any>} [rootDatas]
   * @memberof Mocker
   */
  constructor(options: MockerOptions, rootInstances?: PathMap<Mocker>, rootDatas?: PathMap<any>) {
    const { target, path, config, parent } = options;
    this.target = target;
    this.path = path;
    this.config = config || {};
    this.isRoot = path.length === 0;
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
      const totalIndex = target.length - 1;
      const getInstance = (mIndex?: number): Mocker => {
        mIndex = typeof mIndex === 'number' ? mIndex : makeRandom(0, totalIndex);
        const nowPath = path.concat(mIndex);
        let instance = instances.get(nowPath);
        if (!(instance instanceof Mocker)) {
          instance = new Mocker({
            target: target[mIndex],
            path: nowPath,
            parent: this,
          });
          instances.set(nowPath, instance);
        }
        return instance;
      };
      if (!hasLength) {
        // e.g {"a":["b","c"]},orignal array type
        const mockers = target.map((_: any, index: number) => {
          return getInstance(index);
        });
        this.mockFn = (dpath: Path) => {
          const result: any[] = [];
          mockers.map((instance: Mocker, index: number) => {
            const curDpath = dpath.concat(index);
            const value = instance.mock(curDpath);
            result[index] = value;
            datas.set(curDpath, value);
          });
          return result;
        };
      } else {
        // mock array type
        const makeArrFn = (dpath: Path, instance: Mocker | Mocker[], total?: number) => {
          const result: any[] = [];
          // tslint:disable-next-line:max-line-length
          const makeInstance = instance instanceof Mocker ? (i: number) => instance as Mocker : (i: number) => (instance as Mocker[])[i];
          total = typeof total === 'number' ? total : makeRandom(min, max);
          for (let i = 0; i < total; i++) {
            const cur = makeInstance(i);
            const curDpath = dpath.concat(i);
            const value = cur.mock(curDpath);
            result[i] = value;
            datas.set(curDpath, value);
          }
          return result;
        };
        const makeOptional = (dpath: Path, instance: Mocker, total: number): never | any => {
          let result;
          if (total > 1) {
            throw new Error(`optional func of the total param can not more than 1`);
          } else if (total === 1) {
            result = instance.mock(dpath);
          }
          datas.set(dpath, result);
          return result;
        };
        let resultFn: (dpath: Path, instance: Mocker) => any;
        if (oneOf) {
          if (alwaysArray) {
            // e.g {"a:[0,1]":[{b:1},{"c":1},{"d":1}]}
            resultFn = makeArrFn;
          } else {
            // e.g {"a:{0,5}":["amd","cmd","umd"]}
            resultFn = (dpath: Path, instance: Mocker) => {
              const total = makeRandom(min, max);
              if (total <= 1) {
                return makeOptional(dpath, instance, total);
              }
              return makeArrFn(dpath, instance, total);
            };
          }
          this.mockFn = (dpath: Path) => {
            const instance = getInstance();
            return resultFn(dpath, instance);
          };
        } else {
          // e.g {"a[1,3]":["amd","cmd","umd"]}
          // e.g {"a{0,3}":["amd","cmd","umd"]}
          const makeRandArrFn = (dpath: Path, total?: number) => {
            total = !isNaN(total) ? total : makeRandom(min, max);
            const targets = Array.apply(null, new Array(total)).map(() => {
              return getInstance();
            });
            return makeArrFn(dpath, targets, total);
          };
          if (alwaysArray || min > 1) {
            this.mockFn = (dpath: Path) => {
              return makeRandArrFn(dpath);
            };
          } else {
            this.mockFn = (dpath: Path) => {
              const total = makeRandom(min, max);
              if (total <= 1) {return makeOptional(dpath, getInstance(), total); }
              return makeRandArrFn(dpath, total);
            };
          }
        }
      }
    } else if (dataType === 'object') {
      // parse key
      const keys: NormalObject[] = Object.keys(target).map((i: string) => {
        const val = target[i];
        const { key, config: conf } = Mocker.parseKey(i);
        return {
          key,
          target: val,
          config: conf,
        };
      });
      this.mockFn = (dpath: Path) => {
        const result: NormalObject = {};
        const prevPath = this.path;
        keys.map((item) => {
          const { key, config: conf, target: tar } = item;
          const { optional } = conf;
          const nowPath = prevPath.concat(key);
          const nowDpath = dpath.concat(key);
          if (optional && isOptional()) {
            // do nothing
          } else {
            let instance = instances.get(nowPath);
            if (!(instance instanceof Mocker)) {
              instance = new Mocker({
                target: tar,
                config: conf,
                path: nowPath,
                parent: this,
              });
              instances.set(nowPath, instance);
            }
            const value = instance.mock(nowDpath);
            result[key] = value;
            datas.set(nowDpath, value);
          }
        });
        return result;
      };
    } else {
      if (dataType === 'string') {
        const match = target.match(suchRule);
        const type = match && match[1];
        if(type) {
          const lastType = alias[type] ? alias[type] : type;
          if(AllMockits.hasOwnProperty(lastType)) {
            this.type = lastType;
            const klass = AllMockits[lastType];
            const instance = new klass();
            const meta = target.replace(match[0], '').replace(/^\s*:\s*/, '');
            if (meta !== '') {
              const params = Parser.parse(meta);
              instance.setParams(params);
            }
            this.mockit = instance;
            this.mockFn = (dpath: Path) => instance.make({
              datas,
              dpath,
              such: Such,
            });
            return;
          }
        }
      }
      this.mockFn = (dpath: Path) => target;
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
   * @param {Path} [dpath]
   * @returns
   * @memberof Mocker
   */
  public mock(dpath: Path) {
    const { optional } = this.config;
    if (this.isRoot && optional && isOptional()) {
      return;
    }
    const result = this.mockFn(dpath);
    if(this.isRoot) {
      if(this.promises.length) {
        const queues: Array<Promise<any>> = [];
        const dpaths: Path[] = [];
        this.promises.map((item: PromiseResult ) => {
          const { result: promise, dpath: curDPath } = item;
          queues.push(promise);
          dpaths.push(curDPath);
        });
        return Promise.all(queues).then((results: any[]) => {
          results.map((res: any, i: number) => {
            this.datas.set(dpaths[i], res);
          });
          return this.datas.get([]);
        });
      }
    } else {
      if(utils.isPromise(result)) {
        this.root.promises.push({
          dpath,
          result,
        });
      }
    }
    return result;
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
  public static readonly utils: {[index: string]: (...args: any[]) => any} = utils;
  /**
   *
   *
   * @static
   * @param {string} short
   * @param {string} long
   * @memberof Such
   */
  public static alias(short: string, long: string) {
    if(short === '' || long === '' || short === long) {
      throw new Error(`wrong alias params:[${short}][${long}]`);
    }
    if(aliasTypes.indexOf(long) > -1) {
      throw new Error(`the type of "${long}" has an alias yet,can not use "${short}" for alias name.`);
    } else {
      alias[short] = long;
      aliasTypes.push(long);
    }
  }
  /**
   *
   *
   * @static
   * @param {SuchConfFile} config
   * @memberof Such
   */
  public static config(config: SuchConfFile) {
    const { parsers, types, globals } = config;
    const fnHashs: NormalObject = { parsers: 'parser', types: 'define', globals: 'assign'};
    const lastConf: SuchConfFile = {};
    const such = Such as NormalObject;
    if(config.extends && typeof such.loadConf === 'function') {
      const confFiles = typeof config.extends === 'string' ? [ config.extends ] : config.extends;
      const confs = such.loadConf(confFiles);
      confs.map((conf: SuchConfFile) => {
        delete conf.extends;
        deepCopy(lastConf, conf);
      });
    }
    deepCopy(lastConf, {
      parsers: parsers || {},
      types: types || {},
      globals: globals || {},
    });
    Object.keys(lastConf).map((key: string) => {
      const conf = lastConf[key as keyof SuchConfFile] as NormalObject;
      const fnName = fnHashs[key] || key;
      Object.keys(conf).map((name: string) => {
        const args = typeOf(conf[name]) === 'Array' ? conf[name] : [conf[name]];
        such[fnName](name,  ...args);
      });
    });
  }
  /**
   *
   *
   * @static
   * @param {string} name
   * @param {ParserConfig} config
   * @param {() => void} parse
   * @param {NormalObject} [setting]
   * @returns {(never | void)}
   * @memberof Such
   */
  public static parser(name: string, params: {
    config: ParserConfig;
    parse: () => void;
    setting?: NormalObject;
  }): never | void {
    const { config, parse, setting } = params;
    return Parser.addParser(name, config, parse, setting);
  }
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
    const { param, init, generateFn, generate, configOptions } = config;
    const params = typeof param === 'string' ? Parser.parse(param) : {};
    const constrName = `To${capitalize(type)}`;
    if (!AllMockits.hasOwnProperty(type)) {
      // tslint:disable-next-line:max-line-length
      let klass;
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
          }
          public init() {
            super.init();
            if(isNoEmptyObject(configOptions)) {
              this.configOptions = deepCopy({}, this.configOptions, configOptions);
            }
            if (isFn(init)) {
              init.call(this);
            }
            if (isFn(generateFn)) {
              this.reGenerate(generateFn);
            }
            if(isNoEmptyObject(params)) {
              this.setParams(params);
            }
            this.frozen();
          }
        };
      } else {
        // tslint:disable-next-line:max-classes-per-file
        klass = class extends Mockit<any> {
          constructor() {
            super(constrName);
          }
          public init() {
            if(isNoEmptyObject(configOptions)) {
              this.configOptions = deepCopy({}, this.configOptions, configOptions);
            }
            if(isFn(init)) {
              init.call(this);
            }
            if(isNoEmptyObject(params)) {
              this.setParams(params, undefined);
            }
            this.frozen();
          }
          public generate(options: SuchOptions) {
            return generate.call(this, options);
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
  public readonly instances: PathMap<Mocker>;
  public readonly datas: PathMap<any>;
  protected struct: NormalObject;
  private initail: boolean = false;
  constructor(target: any, options?: SuchConfig) {
    this.target = target;
    this.instances = new PathMap(false);
    this.datas = new PathMap(true);
    this.mocker = new Mocker({
      target,
      path: [],
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
    return this.mocker.mock([]);
  }
}

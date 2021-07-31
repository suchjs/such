import {
  dtNameRule,
  splitor,
  suchRule,
  templateSplitor,
  tmplMockitName,
} from '../data/config';
import PathMap, { TFieldPath } from '../helpers/pathmap';
import * as utils from '../helpers/utils';
import { ALL_MOCKITS } from '../data/mockit';
import Mockit, { BaseExtendMockit } from './mockit';
import ToTemplate from '../mockit/template';
import Dispatcher from '../data/parser';
import store from '../data/store';
import { TFunc, TObj } from '../types/common';
import { TMClass, TMFactoryOptions } from '../types/mockit';
import { TNodeSuch, TSuchSettings } from '../types/node';
import { IParserConfig } from '../types/parser';
import {
  IAsOptions,
  IMockerKeyRule,
  IMockerOptions,
  TSuchInject,
} from '../types/instance';
const {
  isFn,
  isOptional,
  makeRandom,
  typeOf,
  deepCopy,
  isNoEmptyObject,
} = utils;
const { alias, aliasTypes } = store;
/**
 *
 *
 * @class Mocker
 */
export class Mocker {
  /**
   *
   *
   * @static
   * @param {string} key
   * @returns
   * @memberof Mocker
   */
  public static parseKey(
    key: string,
  ): {
    key: string;
    config: TObj;
  } {
    const rule = /(:?)(?:\{(\+?[01]|[1-9]\d*)(?:,([1-9]\d*))?})?(\??)$/;
    let match: Array<string | undefined>;
    const config: TObj = {};
    if ((match = key.match(rule)).length && match[0] !== '') {
      // eslint-disable-next-line prefer-const
      let [all, colon, min, max, opt] = match;
      config.optional = opt === '?';
      config.oneOf = colon === ':';
      if (min !== undefined) {
        config.alwaysArray = min.startsWith('+');
        if (max === undefined) {
          max = min;
        } else if (Number(max) < Number(min)) {
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
  public result: unknown;
  public readonly target: unknown;
  public readonly config: IMockerKeyRule = {};
  public readonly path: TFieldPath;
  public readonly type: string;
  public readonly instances?: PathMap<Mocker>;
  public readonly datas?: PathMap<unknown>;
  public readonly root: Mocker;
  public readonly parent: Mocker;
  public readonly dataType: string;
  public readonly isRoot: boolean;
  public readonly mockFn: (dpath: TFieldPath) => unknown;
  public readonly mockit: Mockit;
  protected readonly storeData: TObj = {};
  /**
   * Creates an instance of Mocker.
   * @param {IMockerOptions} options
   * @param {PathMap<Mocker>} [rootInstances]
   * @param {PathMap<any>} [rootDatas]
   * @memberof Mocker
   */
  constructor(
    options: IMockerOptions,
    rootInstances?: PathMap<Mocker>,
    rootDatas?: PathMap<unknown>,
  ) {
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
    const dataType = typeOf(target).toLowerCase();
    const { min, max, oneOf, alwaysArray } = this.config;
    const { instances, datas } = this.root;
    const hasLength = !isNaN(min);
    this.dataType = dataType;
    if (utils.isArray(target)) {
      // when target is array
      const totalIndex = target.length - 1;
      const getInstance = (mIndex?: number): Mocker => {
        mIndex =
          typeof mIndex === 'number' ? mIndex : makeRandom(0, totalIndex);
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
        const mockers = (target as unknown[]).map(
          (_: unknown, index: number) => {
            return getInstance(index);
          },
        );
        this.mockFn = (dpath: TFieldPath) => {
          const result: unknown[] = [];
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
        const makeArrFn = (
          dpath: TFieldPath,
          instance: Mocker | Mocker[],
          total?: number,
        ) => {
          const result: unknown[] = [];
          const makeInstance =
            instance instanceof Mocker
              ? (_i: number) => instance as Mocker
              : (i: number) => (instance as Mocker[])[i];
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
        const makeOptional = (
          dpath: TFieldPath,
          instance: Mocker,
          total: number,
        ): never | unknown => {
          let result;
          if (total > 1) {
            throw new Error(
              `optional func of the total param can not more than 1`,
            );
          } else if (total === 1) {
            result = instance.mock(dpath);
          }
          datas.set(dpath, result);
          return result;
        };
        let resultFn: (dpath: TFieldPath, instance: Mocker) => unknown;
        if (oneOf) {
          if (alwaysArray) {
            // e.g {"a:[0,1]":[{b:1},{"c":1},{"d":1}]}
            resultFn = makeArrFn;
          } else {
            // e.g {"a:{0,5}":["amd","cmd","umd"]}
            resultFn = (dpath: TFieldPath, instance: Mocker) => {
              const total = makeRandom(min, max);
              if (total <= 1) {
                return makeOptional(dpath, instance, total);
              }
              return makeArrFn(dpath, instance, total);
            };
          }
          this.mockFn = (dpath: TFieldPath) => {
            const instance = getInstance();
            return resultFn(dpath, instance);
          };
        } else {
          // e.g {"a[1,3]":["amd","cmd","umd"]}
          // e.g {"a{0,3}":["amd","cmd","umd"]}
          const makeRandArrFn = (dpath: TFieldPath, total?: number) => {
            total = !isNaN(total) ? Number(total) : makeRandom(min, max);
            const targets = Array.from({
              length: total,
            }).map(() => {
              return getInstance();
            });
            return makeArrFn(dpath, targets, total);
          };
          if (alwaysArray || min > 1) {
            this.mockFn = (dpath: TFieldPath) => {
              return makeRandArrFn(dpath);
            };
          } else {
            this.mockFn = (dpath: TFieldPath) => {
              const total = makeRandom(min, max);
              if (total <= 1) {
                return makeOptional(dpath, getInstance(), total);
              }
              return makeRandArrFn(dpath, total);
            };
          }
        }
      }
    } else {
      if (dataType === 'object') {
        // when target is object
        const oTarget = target as TObj;
        // parse key
        const keys = Object.keys(oTarget).map((i: string) => {
          const val = oTarget[i];
          const { key, config: conf } = Mocker.parseKey(i);
          return {
            key,
            target: val,
            config: conf,
          };
        });
        this.mockFn = (dpath: TFieldPath) => {
          const result: TObj = {};
          const prevPath = this.path;
          keys.map((item) => {
            const { key, config: conf, target: tar } = item;
            const { optional } = conf;
            const nowPath = prevPath.concat(key);
            const nowDpath = dpath.concat(key);
            if (optional && isOptional()) {
              // optional data
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
        let isMockFnOk = false;
        if (typeof target === 'string') {
          const match = target.match(suchRule);
          const type = match && match[1];
          if (type) {
            // check if alias type, if true, point to the real type
            const lastType = alias[type] ? alias[type] : type;
            // if the type is in mockit list, generate a mockit
            // otherwise, take it as a normal string
            if (ALL_MOCKITS.hasOwnProperty(lastType)) {
              this.type = lastType;
              const klass = ALL_MOCKITS[lastType];
              const instance = new klass();
              let meta = target.replace(match[0], '');
              if (meta !== '') {
                // remote the prefix splitor
                if (meta.startsWith(splitor)) {
                  meta = meta.slice(splitor.length);
                }
                // parase params then set
                const params = Dispatcher.parse(meta, {
                  mockit: instance,
                });
                instance.setParams(params);
              }
              this.mockit = instance;
              this.mockFn = (dpath: TFieldPath) =>
                instance.make(
                  {
                    datas,
                    dpath,
                    mocker: this,
                  },
                  Such,
                );
              isMockFnOk = true;
            }
          } else if (target.startsWith(templateSplitor)) {
            const content = target.slice(templateSplitor.length);
            // check if the content is empty
            if (content === '') {
              throw new Error(
                `The path ${
                  path.length ? '(' + path.join('/') + ')' : 'of root'
                } use an empty template literal "${templateSplitor}"`,
              );
            }
            const template = Such.template(content, path);
            // set the mockit as template mockit
            this.mockit = template.mockit;
            this.mockFn = (dpath: TFieldPath) =>
              template.a({
                datas,
                dpath,
                mocker: this,
              });
            isMockFnOk = true;
          } else {
            // string, but begin with translated splitor
            const transKey = '\\' + splitor;
            if (target.startsWith(transKey)) {
              const result = target.slice(1);
              this.mockFn = (_dpath: TFieldPath) => result;
              isMockFnOk = true;
            }
          }
        }
        if (!isMockFnOk) {
          this.mockFn = (_dpath: TFieldPath) => target;
        }
      }
      if (hasLength) {
        // if the key set the config of length
        const origMockFn = this.mockFn;
        this.mockFn = (dpath: TFieldPath) => {
          const total = makeRandom(min, max);
          if (!alwaysArray && total <= 1) {
            return origMockFn(dpath);
          }
          const result = [];
          for (let i = 0; i < total; i++) {
            const nowDpath = dpath.concat(i);
            result.push(origMockFn(nowDpath));
          }
          return result;
        };
      }
    }
    /**
     * name
     */
  }

  /**
   *
   *
   * @param {*} value
   * @memberof Mocker
   */
  public setParams(value: string | TObj): TObj | never {
    if (this.mockit) {
      const instance = this.mockit;
      return instance.setParams(
        typeof value === 'string'
          ? Dispatcher.parse(value, {
              mockit: instance,
            })
          : value,
      );
    } else {
      throw new Error('This mocker is not the mockit type.');
    }
  }

  /**
   *
   *
   * @param {TFieldPath} [dpath]
   * @returns
   * @memberof Mocker
   */
  public mock(dpath: TFieldPath): unknown {
    if (this.isRoot) {
      const { optional } = this.config;
      if (optional && isOptional()) {
        return;
      }
    }
    return (this.result = this.mockFn(dpath));
  }
  /**
   *
   * @param key
   */
  public store(key: string): unknown;
  public store(key: string, value: unknown): void;
  public store(key: string, ...args: unknown[]): unknown | void {
    const argsNum = args.length;
    if (argsNum > 1) {
      throw new Error(
        `wrong arguments length called the mocker's method 'store', expect at most 2 but got ${
          argsNum + 1
        }`,
      );
    }
    if (argsNum === 1) {
      const [value] = args;
      this.storeData[key] = value;
    } else {
      return this.storeData[key];
    }
  }
  /**
   *
   * @param key [string]
   * @returns
   */
  public hasStore(key: string): boolean {
    return this.storeData.hasOwnProperty(key);
  }
}

/**
 * Template Class
 */
interface TemplateInstance {
  [index: number]: {
    value: unknown;
    result: unknown;
  };
}
export class Template {
  private segments: Array<string | Mockit> = [];
  private instances: TemplateInstance = {};
  private instanceIndex = 0;
  public meta = '';
  public mockit: Mockit;
  private options: TSuchInject = {
    datas: null,
    dpath: [],
    mocker: null,
  };
  /**
   * constructor
   */
  constructor(public readonly context = '') {
    // nothing to do
  }
  /**
   * add a string segment
   * @param seg [string]
   */
  public addString(seg: string): void {
    this.segments.push(seg);
  }
  /**
   *
   * @param instance
   * @param optional
   */
  public addInstance(instance: Mockit): void {
    this.segments.push(instance);
    this.instances[this.instanceIndex++] = {
      value: undefined,
      result: '',
    };
  }
  /**
   *
   * @param meta
   */
  public end(meta = ''): void {
    meta = meta.trim();
    const klass = (ALL_MOCKITS[tmplMockitName] as unknown) as typeof ToTemplate;
    const instance = new klass();
    // set the template object
    instance.setTemplate(this);
    // set params for mockit if meta not empty
    if (meta !== '') {
      this.meta = meta;
      const params = Dispatcher.parse(meta, {
        mockit: instance,
      });
      instance.setParams(params);
    }
    // set the mockit, and params
    this.mockit = instance;
  }
  /**
   *
   * @returns
   */
  public a(
    options: TSuchInject = {
      datas: null,
      dpath: [],
      mocker: null,
    },
  ): unknown {
    if (!this.mockit) {
      throw new Error(`the template's mockit object is not initialized yet!`);
    }
    return this.mockit.make(options, Such);
  }
  /**
   * @return string
   */
  public value(): string {
    const { instances } = this;
    let index = 0;
    const result = this.segments.reduce(
      (result: string, item: string | Mockit) => {
        if (typeof item === 'string') {
          result += item;
        } else {
          const instance = instances[index++];
          // it's a mockit instance, generate a value
          const value = item.make(this.options, Such);
          // set the value
          instance.value = value;
          // check the value type
          if (typeof value === 'string') {
            instance.result = value;
          } else if (value === undefined || value === null) {
            instance.result = '';
          } else {
            try {
              // try use toString
              instance.result = value.toString();
            } catch (e) {
              instance.result = '';
            }
          }
          result += instance.result;
        }
        return result;
      },
      '',
    ) as string;
    return result;
  }
}

/**
 *
 *
 * @export
 * @class Such
 */
export default class Such {
  public static readonly utils = utils;
  /**
   *
   *
   * @static
   * @param {string} short
   * @param {string} long
   * @memberof Such
   */
  public static alias(short: string, long: string): void | never {
    if (short === '' || long === '' || short === long) {
      throw new Error(`wrong alias params:'${short}' short for '${long}'`);
    }
    if (aliasTypes.indexOf(long) > -1) {
      throw new Error(
        `the type of "${long}" has an alias yet,can not use "${short}" for alias name.`,
      );
    } else {
      // the short name must obey the dtNameRule
      if (!dtNameRule.test(short)) {
        throw new Error(
          `use a wrong alias short name '${short}', the name should match the regexp '${dtNameRule.toString()}'`,
        );
      }
      alias[short] = long;
      aliasTypes.push(long);
    }
  }
  /**
   * load a config data
   * @static
   * @param {TSuchSettings} config
   * @memberof Such
   */
  public static config(config: TSuchSettings): void {
    const { parsers, types, globals, alias } = config;
    const fnHashs: TObj = {
      parsers: 'parser',
      types: 'define',
      globals: 'assign',
    };
    const lastConf: TSuchSettings = {};
    const such = Such as TStaticSuch & TNodeSuch;
    if (config.extends && typeof such.loadExtend === 'function') {
      const confFiles =
        typeof config.extends === 'string' ? [config.extends] : config.extends;
      const confs = such.loadExtend(confFiles);
      confs.map((conf: TSuchSettings) => {
        delete conf.extends;
        deepCopy(lastConf, conf);
      });
    }
    deepCopy(lastConf, {
      parsers: parsers || {},
      types: types || {},
      globals: globals || {},
      alias: alias || {},
    });
    Object.keys(lastConf).map((key: keyof TSuchSettings) => {
      const conf = lastConf[key];
      const fnName = fnHashs.hasOwnProperty(key) ? fnHashs[key] : key;
      Object.keys(conf).map((name: keyof typeof conf) => {
        const fn = such[fnName as keyof TStaticSuch] as TFunc;
        const args = utils.isArray(conf[name])
          ? conf[name]
          : ([conf[name]] as Parameters<typeof fn>);
        fn(name, ...args);
      });
    });
  }
  /**
   *
   * add a parser
   * @static
   * @param {string} name
   * @param {ParserConfig} config
   * @param {() => void} parse
   * @param {TObj} [setting]
   * @returns {(never | void)}
   * @memberof Such
   */
  public static parser(
    name: string,
    params: {
      config: IParserConfig;
      parse: () => void;
      setting?: TObj;
    },
  ): never | void {
    const { config, parse, setting } = params;
    return Dispatcher.addParser(name, config, parse, setting);
  }
  /**
   *
   * generate a fake data result
   * @static
   * @param {*} target
   * @memberof Such
   */
  public static as(target: unknown, options?: IAsOptions): unknown {
    return Such.instance(target, options).a();
  }
  /**
   *
   * create a such instance
   * @static
   * @param {unknown} target
   * @param {IAsOptions} [options]
   * @returns {Such}
   * @memberof Such
   */
  public static instance(target: unknown, options?: IAsOptions): Such {
    return new Such(target, options);
  }
  /**
   *
   * assign variables for configuration
   * @static
   * @param {string} name
   * @param {*} value
   * @memberof Such
   */
  public static assign(name: string, value: unknown, alwaysVar = false): void {
    store(name, value, alwaysVar);
  }
  /**
   *
   *
   * @static
   * @param {string} type
   * @param {string} fromType
   * @param {(string|TMFactoryOptions)} options
   * @memberof Such
   */
  public static define(type: string, ...args: unknown[]): void | never {
    if (!dtNameRule.test(type)) {
      throw new Error(
        `define a wrong type name '${type}', the name should match the regexp '${dtNameRule.toString()}'`,
      );
    }
    const argsNum = args.length;
    if (argsNum === 0 || argsNum > 2) {
      throw new Error(
        `the static "define" method's arguments is not right, expect 1 or 2 argments, but got ${argsNum}`,
      );
    }
    const opts = args.pop();
    const config: Partial<TMFactoryOptions> =
      argsNum === 2 && typeof opts === 'string'
        ? { param: opts }
        : argsNum === 1 && typeof opts === 'function'
        ? { generate: opts }
        : opts;
    const {
      param,
      init,
      generate,
      validator,
      configOptions,
      allowAttrs,
    } = config;
    const constrName = `To${utils.capitalize(type)}`;
    // init process
    const initProcess = function (this: Mockit, genFn?: GeneratorFunction) {
      if (isNoEmptyObject(configOptions)) {
        this.configOptions = deepCopy({}, this.configOptions, configOptions);
      }
      if (utils.isArray(allowAttrs)) {
        this.setAllowAttrs(...allowAttrs);
      }
      if (isFn(init)) {
        init.call(this, utils);
      }
      const params =
        typeof param === 'string'
          ? Dispatcher.parse(param, {
              mockit: this,
            })
          : {};
      if (isFn(genFn)) {
        this.reGenerate(genFn);
      }
      if (isNoEmptyObject(params)) {
        this.setParams(params, true);
      }
      if (isFn(validator)) {
        if (isFn(this.validator)) {
          const origValidator = this.validator;
          // inject orig validator as the last argument
          this.validator = function (...args: unknown[]) {
            validator(...args, origValidator);
          };
        } else {
          this.validator = validator;
        }
      }
    };
    if (!ALL_MOCKITS.hasOwnProperty(type)) {
      let klass: TMClass;
      if (argsNum === 2) {
        const baseType = args[0];
        const BaseClass = ALL_MOCKITS[baseType as string];
        if (!BaseClass) {
          throw new Error(
            `the defined type "${type}" what based on type of "${baseType}" is not exists.`,
          );
        }
        klass = class
          extends (BaseClass as typeof BaseExtendMockit)
          implements Mockit {
          // set constructor name
          constructor() {
            super(constrName);
          }
          // init
          public init() {
            super.init();
            initProcess.call(this, generate);
          }
        };
      } else {
        klass = class extends Mockit {
          // set constructor name
          constructor() {
            super(constrName);
          }
          // init
          public init() {
            initProcess.call(this);
          }
          // call generate
          public generate(options: TSuchInject, such: TStaticSuch) {
            return generate.call(this, options, such);
          }
          public test() {
            return true;
          }
        };
      }
      ALL_MOCKITS[type] = klass;
    } else {
      throw new Error(`the type "${type}" has been defined yet.`);
    }
  }
  /**
   *
   * @param tpl
   * @returns
   */
  public static template(code: string, path?: TFieldPath): Template {
    const template = new Template();
    const total = code.length;
    const symbol = '`';
    const tsSymbol = templateSplitor.charAt(0);
    const tsLen = templateSplitor.length;
    let curIndex = 0;
    let result = '';
    while (curIndex < total) {
      const ch = code.charAt(curIndex);
      if (ch === symbol) {
        // add the previous result into template
        // reset the result
        if (result !== '') {
          template.addString(result);
          result = '';
        }
        // store the index for error index
        const storeIndex = curIndex;
        const params = {};
        let mockit: Mockit;
        let meta = '';
        let type = '';
        // parse mockit until end
        while (curIndex++ < total) {
          const curCh = code.charAt(curIndex);
          if (curCh === symbol) {
            if (mockit) {
              // if the mockit has initial
              // need parse again
            } else {
              const match = meta.match(suchRule);
              if (
                match &&
                (type = match[1]) &&
                ALL_MOCKITS.hasOwnProperty(type)
              ) {
                mockit = new ALL_MOCKITS[type]();
                meta = meta.replace(match[0], '');
                if (meta === '') {
                  // no params, only data type name
                  break;
                } else if (meta.startsWith(splitor)) {
                  // has a splitor
                  meta = meta.slice(splitor.length);
                }
              } else {
                if (type) {
                  // no type matched
                  throw new Error(
                    `[index:${storeIndex}] The data type expression in template literal \`${meta}\` can't match any of the exists data type.`,
                  );
                } else {
                  // not match a data type
                  throw new Error(
                    `[index:${storeIndex}] The data type expression "${meta}" in template literal is not a correct syntax match the data type rule: ${suchRule.toString()}`,
                  );
                }
              }
            }
            // parse params
            const curParams = Dispatcher.parse(meta, {
              mockit,
              greedy: true,
            });
            if (curParams.hasOwnProperty('errorIndex')) {
              // parse error, return a wrapper data with 'errorIndex'
              // need parse to next symbol
              const errorIndex = (curParams.errorIndex as unknown) as number;
              // remove the parsed string and add the symbol back
              if (errorIndex > 0) {
                meta = meta.slice(errorIndex) + symbol;
              }
              // merge the params
              delete curParams.errorIndex;
              Object.assign(params, curParams);
              // add back to meta string
              meta += curCh;
            } else {
              // all parased ok, set meta empty
              meta = '';
              // merge the params
              Object.assign(params, curParams);
              break;
            }
          } else {
            meta += curCh;
          }
        }
        // no mockit
        if (!mockit) {
          throw new Error(
            `[index:${storeIndex}] The data type expression "${symbol}${meta}" in template literal is not complete correctly, lack of the end symbol "${symbol}"`,
          );
        }
        // check if the meta is empty
        if (meta !== '') {
          throw new Error(
            `[index:${storeIndex}] The data type expression with type :${type} in template literal, its' data attributes string "${symbol}${meta}" is lack of the end symbol "${symbol}" or can't parsed correctly.`,
          );
        }
        // set params if params is not empty
        if (isNoEmptyObject(params)) {
          mockit.setParams(params);
        }
        // add the mockit to segments
        template.addInstance(mockit);
      } else if (ch === '\\') {
        curIndex++;
        if (curIndex < total) {
          const next = code.charAt(curIndex);
          if (next === symbol || next === splitor) {
            result += next;
          } else {
            result += ch + next;
          }
        } else {
          // take a normal slash
          result += ch;
          break;
        }
      } else {
        if (
          ch === tsSymbol &&
          code.slice(curIndex, curIndex + tsLen) === templateSplitor
        ) {
          if (curIndex === 0) {
            // no content
            throw new Error(
              `[index:${
                path ? tsLen : 0
              }] The template literal must set a none empty content before "${templateSplitor}"${
                path
                  ? '(in path ' +
                    (path.length > 0 ? path.join('/') : 'root') +
                    ')'
                  : ''
              }`,
            );
          }
          // meet the end splitor
          // jump to the index after it, use `tsLen` not `tsLen - 1`
          curIndex += tsLen;
          break;
        } else {
          // normal string
          result += ch;
        }
      }
      curIndex++;
    }
    // if the result is not empty
    if (result !== '') {
      template.addString(result);
    }
    // if there's still string in the last
    if (curIndex < total) {
      template.end(code.slice(curIndex));
    } else {
      template.end();
    }
    return template;
  }

  public readonly target: unknown;
  public readonly options: IAsOptions;
  public readonly mocker: Mocker;
  public readonly instances: PathMap<Mocker>;
  public readonly mockits: PathMap<TObj>;
  public readonly datas: PathMap<unknown>;
  public readonly paths: PathMap<TFieldPath>;
  private initail = false;
  /**
   * constructor of such
   * @param target [unkown] the target need to be mocking
   * @param options
   */
  constructor(target: unknown, options?: IAsOptions) {
    this.target = target;
    this.instances = new PathMap(false);
    this.datas = new PathMap(true);
    this.mocker = new Mocker(
      {
        target,
        path: [],
        config: options && options.config,
      },
      this.instances,
      this.datas,
    );
  }
  /**
   *
   *
   * @returns
   * @memberof Such
   */
  public a(): unknown {
    if (!this.initail) {
      // set initial true
      this.initail = true;
    } else {
      // clear the data
      this.datas.clear();
    }
    return this.mocker.mock([]);
  }
}

export type TStaticSuch = typeof Such;

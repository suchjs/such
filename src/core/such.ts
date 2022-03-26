import {
  dtNameRule,
  enumConfig,
  splitor,
  suchRule,
  templateSplitor,
  tmplMockitName,
  tmplNamedRule,
} from '../data/config';
import PathMap, { TFieldPath } from '../helpers/pathmap';
import * as utils from '../helpers/utils';
import Mockit, { BaseExtendMockit } from './mockit';
import ToTemplate from '../mockit/template';
import Dispatcher from '../data/parser';
import globalStoreData, {
  createNsStore,
  getNsMockit,
  getNsStore,
  Store,
  TStoreAllowedClearFileds,
} from '../data/store';
import { TFunc, TObj, TPath, TStrList, ValueOf } from '../types/common';
import {
  TMClass,
  TMFactoryOptions,
  TMGenerateFn,
  TMParams,
  TMParamsValidFn,
} from '../types/mockit';
import { TSuchSettings } from '../types/node';
import { IParserConfig } from '../types/parser';
import {
  IAInstanceOptions,
  IAsOptions,
  IMockerKeyRule,
  IMockerOptions,
  IMockerPathRuleKeys,
  EnumSpecialType,
  TSuchInject,
  AssignType,
  TAssignedData,
  TDynamicConfig,
  TDynamicDependCallback,
  TDynamicDependValue,
  TInstanceDynamicConfig,
} from '../types/instance';
// import { NSuch } from '../index';
const {
  isFn,
  isOptional,
  isObject,
  isArray,
  isNoEmptyObject,
  makeRandom,
  typeOf,
  deepCopy,
  path2str,
  capitalize,
  hasOwn,
} = utils;
/**
 *
 * @param instanceOptions [IAInstanceOptions]
 * @param path [TFieldPath]
 * @returns boolean
 */
const getOptional = (
  instanceOptions: IAInstanceOptions,
  depender: Depender,
  path: TFieldPath,
  config: IMockerKeyRule,
): boolean | never => {
  const strPath = path2str(path);
  const instanceConfig = instanceOptions?.keys;
  let needReturn = false;
  let needOptional = true;
  let curConfig = (instanceConfig && instanceConfig[strPath]) || {};
  if (depender) {
    const config = depender.getDynamicConfig(strPath);
    if (config) {
      curConfig = Object.assign(config.key || {}, curConfig);
    }
  }
  if (isNoEmptyObject(curConfig)) {
    if (typeof curConfig.exist === 'boolean') {
      needOptional = false;
      // when not exist, just return
      needReturn = !curConfig.exist;
    } else if (!hasOwn(config, 'min')) {
      const hasMin = hasOwn(curConfig, 'min');
      const hasMax = hasOwn(curConfig, 'max');
      // if the field set min, it's maybe an array field
      // don't set min or max instead of exist
      // ignore the min and max if config has min
      // no need check count because not hasLength
      if (hasMin || hasMax) {
        const min = hasMin ? curConfig.min : 0;
        const max = hasMax ? curConfig.max : 1;
        if (min === max) {
          needOptional = false;
          // not needOptional
          if (max === 0) {
            // must not exists
            needReturn = true;
          } else {
            // must exists
            needReturn = false;
          }
        }
      }
    }
  }
  // check if need isOptional
  if (needOptional) {
    needReturn = isOptional();
  }
  return needReturn;
};
/**
 *
 * @param instanceOptions [IAInstanceOptions]
 * @param path [TFieldPath]
 * @param config [IMockerKeyRule]
 * @returns
 */
const getMinAndMax = (
  instanceOptions: IAInstanceOptions,
  depender: Depender,
  path: TFieldPath,
  config: IMockerKeyRule,
): Pick<IMockerKeyRule, 'min' | 'max'> | never => {
  let { min, max } = config;
  const strPath = path2str(path);
  const instanceConfig = instanceOptions?.keys;
  let curConfig = (instanceConfig && instanceConfig[strPath]) || {};
  if (depender) {
    const config = depender.getDynamicConfig(strPath);
    if (config) {
      curConfig = Object.assign(config.key || {}, curConfig);
    }
  }
  if (isNoEmptyObject(curConfig)) {
    if (hasOwn(curConfig, 'min')) {
      min = curConfig.min;
    }
    if (hasOwn(curConfig, 'max')) {
      max = curConfig.max;
    }
  }
  return {
    min,
    max,
  };
};

const warn = (message: string) => {
  // eslint-disable-next-line no-console
  console.warn(message);
};
const setExportWarn = (method: string, param: string) => {
  warn(
    `You can't call the "${method}('${param}')" method for the root such instance, the root such's data is global exported by default.`,
  );
};
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
  public static parseKey(key: string): {
    key: string;
    config: IMockerKeyRule;
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
  private instanceOptions?: IAInstanceOptions;
  protected readonly storeData: TObj = {};
  public result: unknown;
  public isEnum: boolean;
  public next?: Mocker;
  public template?: Template;
  public mockit: Mockit;
  public count = 1;
  public index = -1;
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
  public readonly namespace: string;
  public readonly such: Such;
  public readonly depender: Depender;
  public readonly mockFn: (dpath: TFieldPath) => unknown;
  /**
   * Creates an instance of Mocker.
   * @param {IMockerOptions} options
   * @param {PathMap<Mocker>} [rootInstances]
   * @param {PathMap<any>} [rootDatas]
   * @memberof Mocker
   */
  constructor(
    options: IMockerOptions,
    owner?: {
      such?: Such;
      namespace?: string;
      instances?: PathMap<Mocker>;
      datas?: PathMap<unknown>;
      depender?: Depender;
    },
  ) {
    // set the mocker properties
    const { target, path, config, parent } = options;
    this.target = target;
    this.path = path;
    this.config = config || {};
    this.isRoot = path.length === 0;
    if (owner) {
      const { such, namespace, instances, datas, depender } = owner;
      this.such = such;
      this.namespace = namespace;
      this.instances = instances;
      this.datas = datas;
      this.depender = depender;
    }
    if (this.isRoot) {
      this.root = this;
      this.parent = this;
    } else {
      this.parent = parent;
      this.root = parent.root;
    }
    const dataType = typeOf(target).toLowerCase();
    this.dataType = dataType;
    // check config and target
    const { oneOf, alwaysArray } = this.config;
    const { instances, datas, depender } = this.root;
    const hasLength = !isNaN(this.config.min);
    // use oneOf key rule for the none array field
    if (oneOf && !isArray(target)) {
      throw new Error(
        `The field key of '${path2str(
          path,
        )}' use a colon ':' to set a 'oneOf' config, but the value of the field is not an array.`,
      );
    }
    if (isArray(target)) {
      // when target is array
      const totalIndex = target.length - 1;
      const getInstance = (mIndex?: number): Mocker => {
        mIndex =
          typeof mIndex === 'number'
            ? mIndex
            : (() => {
                let keys;
                // if have keys and a config of current path with index
                if ((keys = this.root.instanceOptions?.keys) || depender) {
                  const strPath = path2str(path);
                  const curConfig =
                    keys && keys[strPath]
                      ? keys[strPath]
                      : (() => {
                          const config = depender.getDynamicConfig(strPath);
                          if (config && config.key) {
                            return config.key;
                          }
                        })();
                  if (curConfig && typeof curConfig.index === 'number') {
                    if (curConfig.index > totalIndex) {
                      throw new Error(
                        `The target's field with a path '${strPath}' in instanceOptions keys set a 'index' ${curConfig.index} bigger than the max index ${totalIndex}.`,
                      );
                    }
                    return (this.index = curConfig.index);
                  }
                }
                return (this.index = makeRandom(0, totalIndex));
              })();
        const curPath = path.concat(mIndex);
        let instance = instances.get(curPath);
        if (!(instance instanceof Mocker)) {
          instance = new Mocker({
            target: target[mIndex],
            path: curPath,
            parent: this,
          });
          instances.set(curPath, instance);
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
          total =
            typeof total === 'number'
              ? total
              : (() => {
                  const { min, max } = getMinAndMax(
                    this.root.instanceOptions,
                    depender,
                    this.path,
                    this.config,
                  );
                  return makeRandom(min, max);
                })();
          // set count if has length
          this.count = total;
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
            // e.g {"a:{+0,1}":[{b:1},{"c":1},{"d":1}]}
            resultFn = makeArrFn;
          } else {
            // e.g {"a:{0,5}":["amd","cmd","umd"]}
            resultFn = (dpath: TFieldPath, instance: Mocker) => {
              const { min, max } = getMinAndMax(
                this.root.instanceOptions,
                depender,
                this.path,
                this.config,
              );
              const total = makeRandom(min, max);
              // set count num
              this.count = total;
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
          // e.g {"a{0,3}":["amd","cmd","umd"]}
          const makeRandArrFn = (dpath: TFieldPath, total?: number) => {
            total = !isNaN(total)
              ? Number(total)
              : (() => {
                  const { min, max } = getMinAndMax(
                    this.root.instanceOptions,
                    depender,
                    this.path,
                    this.config,
                  );
                  return makeRandom(min, max);
                })();
            // set count
            this.count = total;
            const targets = Array.from({
              length: total,
            }).map(() => {
              return getInstance();
            });
            return makeArrFn(dpath, targets, total);
          };
          const { min } = this.config;
          if (alwaysArray || min > 1) {
            this.mockFn = (dpath: TFieldPath) => {
              return makeRandArrFn(dpath);
            };
          } else {
            this.mockFn = (dpath: TFieldPath) => {
              const { min, max } = getMinAndMax(
                this.root.instanceOptions,
                depender,
                this.path,
                this.config,
              );
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
          const target = oTarget[i];
          const { key, config } = Mocker.parseKey(i);
          return {
            key,
            target,
            config,
          };
        });
        this.mockFn = (dpath: TFieldPath) => {
          const result: TObj = {};
          const prevPath = this.path;
          keys.map((item) => {
            const { key, config, target } = item;
            const { optional } = config;
            const curPath = prevPath.concat(key);
            const curDpath = dpath.concat(key);
            if (optional) {
              const needReturn = getOptional(
                this.root.instanceOptions,
                depender,
                curPath,
                config,
              );
              // optional data
              if (needReturn) {
                return;
              }
            }
            let instance = instances.get(curPath);
            if (!(instance instanceof Mocker)) {
              instance = new Mocker({
                target,
                config,
                path: curPath,
                parent: this,
              });
              instances.set(curPath, instance);
            }
            const value = instance.mock(curDpath);
            result[key] = value;
            datas.set(curDpath, value);
          });
          return result;
        };
      } else {
        let isMockFnOk = false;
        if (typeof target === 'string') {
          const match = target.match(suchRule);
          if (match) {
            // check if alias type, if true, point to the real type
            const thirdNs = match[1] && match[1].replace(/\/$/, '');
            const { realType, klass } = getNsMockit(
              match[2],
              this.root.namespace,
              thirdNs,
            );
            // if the type is in mockit list, generate a mockit
            // otherwise, take it as a normal string
            if (klass) {
              this.type = realType;
              const instance = new klass(this.root.namespace);
              const { specialType } = instance.getStaticProps();
              this.isEnum = specialType === EnumSpecialType.Enum;
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
              const strPath = path2str(path);
              this.mockit = instance;
              this.mockFn = (dpath: TFieldPath) => {
                const { root } = this;
                const { instanceOptions } = root;
                const inject: TSuchInject = {
                  datas,
                  dpath,
                  mocker: this,
                };
                // execute depender
                if (depender) {
                  const config = depender.getDynamicConfig(strPath);
                  if (config) {
                    Object.assign(inject, config);
                  }
                }
                // execute options
                if (instanceOptions) {
                  // inject the current key config
                  if (instanceOptions.keys) {
                    const config = instanceOptions.keys[strPath];
                    if (config && hasOwn(config, 'index')) {
                      inject.key = {
                        index: config.index,
                      };
                    }
                  }
                  // inject the current override params
                  if (instanceOptions.params) {
                    const param = instanceOptions.params[strPath];
                    if (param) {
                      inject.param = param;
                    }
                  }
                }
                const value = instance.make(inject, root.such);
                return value;
              };
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
            const template = this.root.such.template(
              content,
              path,
              this.root.namespace,
            );
            // set the mockit as template mockit
            this.mockit = template.mockit;
            this.mockFn = (dpath: TFieldPath) =>
              template.a({
                datas,
                dpath,
                mocker: this,
              });
            this.template = template;
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
        // dataType is not a mockit type
        // just return the original value
        if (!isMockFnOk) {
          this.mockFn = (_dpath: TFieldPath) => target;
        }
      }
      // if the key has a length
      // generate the data for length times
      if (hasLength) {
        // if the key set the config of length
        const origMockFn = this.mockFn;
        this.mockFn = (dpath: TFieldPath) => {
          const { min, max } = getMinAndMax(
            this.root.instanceOptions,
            depender,
            this.path,
            this.config,
          );
          const total = makeRandom(min, max);
          this.count = total;
          if (!alwaysArray && total <= 1) {
            return origMockFn(dpath);
          }
          const result = [];
          for (let i = 0; i < total; i++) {
            const curDpath = dpath.concat(i);
            result.push(origMockFn(curDpath));
          }
          return result;
        };
      }
    }
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
  public mock<T = unknown>(dpath: TFieldPath): T {
    if (this.isRoot) {
      const { optional } = this.config;
      if (optional) {
        // check if has instance config
        const needReturn = getOptional(
          this.instanceOptions,
          this.depender,
          [],
          this.config,
        );
        if (needReturn) {
          return;
        }
      }
    }
    const value = (this.result = (this.result = this.mockFn(dpath)) as T);
    if (this.root.depender) {
      const { count, index } = this;
      this.root.depender.triggerDependValued(path2str(this.path), {
        value,
        count,
        index,
      });
    }
    return value;
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
    return hasOwn(this.storeData, key);
  }
  /**
   *
   * @param instanceOptions
   */
  public setInstanceOptions(instanceOptions?: IAInstanceOptions): void {
    this.instanceOptions = instanceOptions;
  }
}

interface TemplateData {
  value: unknown;
  result: unknown;
}
interface TemplateIndexData {
  [index: number]: TemplateData;
}
interface TemplateIndexHash {
  [index: number]: string;
}

interface TemplateNamedData {
  [index: string]: TemplateData | TemplateData[];
}
/**
 * Template Class
 */
export class Template {
  private segments: Array<string | Mockit> = [];
  private indexData: TemplateIndexData = {};
  private indexHash: TemplateIndexHash = {};
  private namedData: TemplateNamedData = {};
  private index = 0;
  private typeContexts: TemplateIndexHash = {};
  public meta = '';
  public params: TMParams = {};
  public mockit: Mockit;
  public mocker?: Mocker;
  public isValued = false;
  /**
   * constructor
   */
  constructor(
    public readonly context = '',
    public readonly such: Such,
    public readonly path: TFieldPath = [],
  ) {
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
  public addInstance(
    instance: Mockit,
    typeContext: string,
    refName = '',
  ): void {
    this.segments.push(instance);
    this.typeContexts[this.index] = typeContext;
    if (refName) {
      this.indexHash[this.index] = refName;
    }
    this.index++;
  }
  /**
   *
   * @param index [number]
   * @returns the reference instance's values
   */
  public getRefValue(index: string | number): TemplateData | TemplateData[] {
    if (!isNaN(index as number)) {
      return this.indexData[Number(index)];
    }
    return this.namedData[index];
  }
  /**
   *
   * @param meta
   */
  public end(meta = ''): void {
    meta = meta.trim();
    const klass = globalStoreData.mockits[
      tmplMockitName
    ] as unknown as typeof ToTemplate;
    const instance = new klass(this.such.namespace);
    // set the template object
    instance.setTemplate(this);
    // set params for mockit if meta not empty
    if (meta !== '') {
      this.meta = meta;
      const params = Dispatcher.parse(meta, {
        mockit: instance,
      });
      this.params = params;
      instance.setParams(params);
    }
    // set the mockit, and params
    this.mockit = instance;
  }
  /**
   *
   * @returns
   */
  public a<T = string>(
    options: TSuchInject = {
      datas: null,
      dpath: [],
      mocker: null,
      key: null,
      param: null,
    },
  ): T {
    if (!this.mockit) {
      throw new Error(`the template's mockit object is not initialized yet!`);
    }
    return this.mockit.make(options, this.such) as T;
  }
  /**
   * @return string
   */
  public value(
    options: TSuchInject = {
      datas: null,
      dpath: [],
      mocker: null,
      key: null,
      param: null,
    },
  ): string {
    let index = 0;
    // clear the indexData and namedData
    // so every time get the values only generated
    const mocker =
      options.mocker ||
      this.mocker ||
      (() => {
        const { mocker } = this.such.instance(this.context);
        mocker.template = this;
        this.mocker = options.mocker = mocker;
        return mocker;
      })();
    const { path, typeContexts } = this;
    const { instances } = mocker.root;
    const namedData: TemplateNamedData = {};
    const setInstanceMocker = !this.isValued
      ? (index: number, refName: string, mockit: Mockit): Mocker => {
          const curPath = path.concat('${' + index + '}');
          let curMocker = instances.get(curPath);
          if (!curMocker) {
            // define a new mocker for the template inner types
            curMocker = new Mocker({
              target: typeContexts[index],
              path: curPath,
              parent: mocker,
            });
            // set the inner mocker's mockit
            curMocker.mockit = mockit;
            // add the inner mocker into instances
            instances.set(curPath, curMocker);
          }
          if (refName) {
            // also add a named inner mocker
            const refPath = path.concat('${' + refName + '}');
            const refMocker = instances.get(refPath);
            if (!refMocker) {
              instances.set(refPath, curMocker);
            } else {
              // use a linkedlist save the inner mocker
              refMocker.next = curMocker;
            }
          }
          return curMocker;
        }
      : (index: number, _refName: string): Mocker => {
          // do nothing
          const curPath = path.concat('${' + index + '}');
          return instances.get(curPath);
        };
    this.indexData = {};
    this.namedData = namedData;
    const result = this.segments.reduce(
      (result: string, item: string | Mockit) => {
        if (typeof item === 'string') {
          result += item;
        } else {
          const instanceData = (this.indexData[index] = {
            value: undefined as unknown,
            result: '',
          });
          // check if has ref name
          const refName = this.indexHash[index];
          if (refName) {
            if (!hasOwn(namedData, refName)) {
              namedData[refName] = instanceData;
            } else {
              // multiple same name
              if (isArray(namedData[refName])) {
                (namedData[refName] as TemplateData[]).push(instanceData);
              } else {
                namedData[refName] = [
                  namedData[refName] as TemplateData,
                  instanceData,
                ];
              }
            }
          }
          const curMocker = setInstanceMocker(index, refName, item);
          index++;
          // it's a mockit instance, generate a value
          const value = item.make(options, this.such);
          // set the value
          instanceData.value = value;
          // check the value type
          if (typeof value === 'string') {
            instanceData.result = value;
          } else if (value === undefined || value === null) {
            instanceData.result = '';
          } else {
            try {
              // try use toString
              instanceData.result = value.toString();
            } catch (e) {
              instanceData.result = '';
            }
          }
          // set the result of current mocker
          curMocker.result = instanceData.result;
          // concat the result
          result += instanceData.result;
        }
        return result;
      },
      '',
    ) as string;
    this.isValued = true;
    return result;
  }
}

/**
 * Class DependTreeNode
 */
class DependTreeNode {
  // child nodes
  public childs: DependTreeNode[] = [];
  // parent nodes
  public parents: DependTreeNode[] = [];
  // static method, check if equal node
  public static isSameNode(one: DependTreeNode, another: DependTreeNode) {
    return one.id === another.id;
  }
  // constructor
  constructor(public readonly id: TPath, public readonly depender: Depender) {
    // nothing to do
  }
  // check the node if not exist then add
  private checkThenAdd(nodes: DependTreeNode[], node: DependTreeNode): boolean {
    // check if the node is exist, if not exist then add
    const index = nodes.findIndex((curNode) => curNode.id === node.id);
    if (index < 0) {
      nodes.push(node);
      return true;
    }
    return false;
  }
  // add a child node
  public addChild(node: DependTreeNode) {
    this.checkThenAdd(this.childs, node);
  }
  // add a parent node
  public addParent(node: DependTreeNode) {
    this.checkThenAdd(this.parents, node);
    this.depender.setRootNode(this, node);
  }
}

type TDynamicExecuteFn = {
  checked: boolean;
  fn: TDynamicDependCallback;
};

class Depender {
  // check if two paths have relation
  public static validateIfRelatviePath(a: TPath, b: TPath): never | void {
    const aLen = a.length;
    const bLen = b.length;
    if (aLen === bLen) {
      if (a === b) {
        throw new Error(
          `The path of '${a}' in instance options's field 'dynamics' set a depend path of itself.`,
        );
      }
    } else {
      let long = a;
      let short = b;
      let relation = 'ancestor';
      if (aLen < bLen) {
        long = b;
        short = a;
        relation = 'descendant';
      }
      const hasRelation =
        long.includes(short) && long.charAt(short.length) === '/';
      if (hasRelation) {
        throw new Error(
          `The path of '${a}' in instance options's field 'dynamics' set a depend path of it's ${relation} '${b}' is not valid.`,
        );
      }
    }
  }
  // the root nodes
  private rootNodes: DependTreeNode[] = [];
  // all nodes
  private allNodes: DependTreeNode[] = [];
  // the dependencies
  private dependencies: DependTreeNode[][] = [];
  // depend value update execute fns
  private dependValuedUpdateFns: TObj<
    Array<(value: TDynamicDependValue) => void>
  > = {};
  // dynamic execute fns
  private dynamicExecuteFns: TObj<TDynamicExecuteFn> = {};
  // add depend value update fns
  private addDependValuedUpdateFns<
    T extends (value: TDynamicDependValue) => void,
  >(id: TPath, fn: T) {
    if (isArray(this.dependValuedUpdateFns[id])) {
      this.dependValuedUpdateFns[id].push(fn);
    } else {
      this.dependValuedUpdateFns[id] = [fn];
    }
  }
  // get node if node exist then return
  // otherwise add a new node and return
  private getNode(id: TPath): DependTreeNode {
    const { allNodes } = this;
    let node = allNodes.find((node) => node.id === id);
    if (!node) {
      node = new DependTreeNode(id, this);
      allNodes.push(node);
    }
    return node;
  }
  // add a node by id
  public addNode(
    parentId: TPath,
    childIds: TPath[],
    callback: TDynamicDependCallback,
  ) {
    const parentNode = this.getNode(parentId);
    const parentPath = parentNode.id;
    const args: Array<TDynamicDependValue> = [];
    for (const childId of childIds) {
      const childNode = this.getNode(childId);
      // check releation
      Depender.validateIfRelatviePath(parentPath, childNode.id);
      parentNode.addChild(childNode);
      childNode.addParent(parentNode);
      // argument
      const curArg: TDynamicDependValue = {};
      args.push(curArg);
      this.addDependValuedUpdateFns(childId, (value: TDynamicDependValue) => {
        const origLoop = curArg.loop || 0;
        utils.setObjectEmpty(curArg);
        Object.assign(curArg, value);
        curArg.loop = origLoop + 1;
      });
    }
    const dynamic: TDynamicExecuteFn = (this.dynamicExecuteFns[parentId] = {
      checked: false,
      fn: () => {
        if (!dynamic.checked) {
          let index = 0;
          for (const arg of args) {
            if (!hasOwn(arg, 'value')) {
              throw new Error(
                `The path ${parentId} depend a path of '${childIds[index]}' not make a value yet, make sure the depend path is appear before the current path.`,
              );
            }
            index++;
          }
          dynamic.checked = true;
        }
        return callback(...args);
      },
    });
  }
  // refresh the root node
  public setRootNode(node: DependTreeNode, parent: DependTreeNode) {
    const index = this.rootNodes.findIndex((curNode) =>
      DependTreeNode.isSameNode(curNode, node),
    );
    // if found, remove the child node and add the parent node
    // otherwise, just push the parent node as a root node
    if (index > -1) {
      this.rootNodes.splice(index, 1, parent);
    } else {
      this.rootNodes.push(parent);
    }
  }
  // check loop dependence
  private checkLoopDependence(
    parentNodes: DependTreeNode[],
    curNode: DependTreeNode,
  ) {
    const curId = curNode.id;
    if (parentNodes.find((node) => node.id === curId)) {
      throw new Error(
        `The depend path of '${parentNodes[parentNodes.length - 1].id}' and '${
          curNode.id
        }' cause a loop dependencies.`,
      );
    }
  }
  // loop the tree node
  private loopTree(
    node: DependTreeNode,
    parentNodes: DependTreeNode[],
    result: DependTreeNode[][],
  ) {
    this.checkLoopDependence(parentNodes, node);
    const nowParentNodes = parentNodes.concat(node);
    if (node.childs.length) {
      for (const childNode of node.childs) {
        this.loopTree(childNode, nowParentNodes, result);
      }
    } else {
      result.push(nowParentNodes);
    }
  }
  // check dependencies
  public check(): void | never {
    for (const rootNode of this.rootNodes) {
      this.loopTree(rootNode, [], this.dependencies);
    }
  }
  // get dynamic config
  public getDynamicConfig(path: TPath): TInstanceDynamicConfig | void {
    return this.dynamicExecuteFns[path]?.fn();
  }
  // trigger depend value
  public triggerDependValued(path: TPath, value: TDynamicDependValue): void {
    const fns = this.dependValuedUpdateFns[path];
    if (isArray(fns)) {
      for (const fn of fns) {
        fn(value);
      }
    }
  }
}

/**
 *
 *
 * @export
 * @class Such
 */
export default class SuchMocker<T = unknown> {
  /**
   * instance properties
   */
  public readonly mocker: Mocker;
  public readonly instances: PathMap<Mocker>;
  public readonly mockits: PathMap<TObj>;
  public readonly datas: PathMap<unknown>;
  public readonly depender: Depender;
  private initail = false;
  private ruleKeys: IMockerPathRuleKeys;
  /**
   * constructor of such
   * @param target [unkown] the target need to be mocking
   * @param options
   */
  constructor(
    public readonly target: unknown,
    public readonly such: Such,
    public readonly namespace?: string,
    public readonly options?: IAsOptions,
  ) {
    this.instances = new PathMap(false);
    this.datas = new PathMap(true);
    // dynamics
    if (options?.config?.dynamics) {
      this.depender = new Depender();
      this.initDynamics(options.config.dynamics, this.depender);
    }
    // build a mocker
    this.mocker = new Mocker(
      {
        target,
        path: [],
        config: options?.config,
      },
      this,
    );
    // set root mocker instance
    this.instances.set([], this.mocker);
  }
  /**
   * Add dynamic config or value
   * @param target
   * @param depends
   * @param callback
   * @returns
   */
  private initDynamics(
    dynamics: TObj<TDynamicConfig>,
    depender: Depender,
  ): void {
    // judge if has loop dependence
    Object.keys(dynamics).forEach((curPath) => {
      const [dependPaths, callback] = dynamics[curPath];
      depender.addNode(
        curPath,
        isArray(dependPaths) ? dependPaths : [dependPaths],
        callback,
      );
    });
    depender.check();
  }
  /**
   *
   *
   * @returns
   * @memberof Such
   */
  public a(instanceOptions?: IAInstanceOptions): T {
    if (!this.initail) {
      // set initial true
      this.initail = true;
    } else {
      // clear the data
      this.datas.clear();
    }
    // always set instance optiosn
    this.mocker.setInstanceOptions(instanceOptions);
    // if has keys, check the keys
    this.checkKeys(instanceOptions?.keys);
    // mock the value
    return this.mocker.mock([]);
  }
  /**
   * get the optional or length fields's config
   * @returns {IMockerPathRuleKeys}
   * @memberof Such
   */
  public keys(): IMockerPathRuleKeys {
    if (this.ruleKeys) {
      return this.ruleKeys;
    }
    const { target, ruleKeys = {} } = this;
    // loop the fields
    const loop = (obj: unknown, path: TFieldPath) => {
      if (isObject(obj)) {
        for (const curKey in obj) {
          if (hasOwn(obj, curKey)) {
            const { config, key } = Mocker.parseKey(curKey);
            const curPath = path.concat(key);
            // if has config
            if (isNoEmptyObject(config)) {
              ruleKeys[path2str(curPath)] = config;
            }
            // recursive
            loop(obj[curKey], curPath);
          }
        }
      } else if (isArray(obj)) {
        obj.forEach((value, index) => {
          loop(value, path.concat(index));
        });
      }
    };
    // loop the target
    loop(target, []);
    // the root
    ruleKeys['/'] = this.options?.config;
    // return the rulekeys
    return ruleKeys;
  }
  /**
   * check the optional or length config of the field is ok or not
   * @param {IAInstanceOptions.keys} keys
   * @returns {(void | never)}
   * @memberof Such
   */
  public checkKeys(
    keys: ValueOf<Pick<IAInstanceOptions, 'keys'>>,
  ): void | never {
    // check the keys if the keys is an object not empty
    if (keys && isNoEmptyObject(keys)) {
      const fields = this.keys();
      for (const path in keys) {
        if (hasOwn(keys, path)) {
          if (!hasOwn(fields, path)) {
            throw new Error(
              `The target's field with a path '${path}' in instanceOptions keys is not optional or having a length with min/max, but you set a config on it.`,
            );
          } else {
            const value = keys[path];
            const pathSegs = path === '/' ? [] : path.slice(1).split('/');
            const curInstance = this.instances.get(pathSegs);
            const config = curInstance?.isEnum
              ? enumConfig
              : fields[path] || {};
            const hasExist = typeof value.exist === 'boolean';
            // check optional
            if (hasExist && config.optional !== true) {
              throw new Error(
                `The target's field with a path '${path}' in instanceOptions keys is not optional, but you set the key 'exist' on it.`,
              );
            }
            // check count
            const hasMin = hasOwn(value, 'min');
            const hasMax = hasOwn(value, 'max');
            if (hasMin || hasMax) {
              if (value.exist === false) {
                // has set the exist false
                // no need to set min and max
                throw new Error(
                  `The target's field with a path '${path}' in instanceOptions keys has set 'exist' be false, no need to set the 'min'/'max' value again.`,
                );
              }
              let confMin: number;
              let confMax: number;
              if (hasOwn(config, 'min')) {
                // first use the config's min and max
                confMin = config.min;
                confMax = hasOwn(config, 'max') ? config.max : confMin;
              } else {
                // then if is optional, set the min and max to 0 and 1
                if (config.optional) {
                  // if has 'exist', don't use the 'min'/'max' value
                  if (hasExist) {
                    throw new Error(
                      `The target's field with a path '${path}' in instanceOptions keys is not having a length with min/max, you can't set both the 'exist' field and the 'min'/'max'.`,
                    );
                  }
                  confMin = 0;
                  confMax = 1;
                } else {
                  throw new Error(
                    `The target's field with a path '${path}' in instanceOptions keys is not having a length with min/max, but you set a length on it.`,
                  );
                }
              }
              const checkMinOrMax = (
                val: unknown,
                name: 'min' | 'max',
              ): void | never => {
                if (typeof val !== 'number') {
                  throw new Error(
                    `The target's field with a path '${path}' in instanceOptions keys set a length with none number ${name} '${val}'.`,
                  );
                }
                if (val > confMax) {
                  throw new Error(
                    `The target's field with a path '${path}' in instanceOptions keys set a length with ${name} '${val}' bigger than the field allowed max '${confMax}'.`,
                  );
                }
                if (val < confMin) {
                  throw new Error(
                    `The target's field with a path '${path}' in instanceOptions keys set a length with ${name} '${val}' less than the field allowed min '${confMin}'.`,
                  );
                }
              };
              // check the min
              if (hasMin) {
                checkMinOrMax(value.min, 'min');
              }
              // check the max
              if (hasMax) {
                checkMinOrMax(value.max, 'max');
                if (hasMin) {
                  // check the min and max
                  if (value.min > value.max) {
                    throw new Error(
                      `The target's field with a path '${path}' in instanceOptions keys set a length with min '${value.min}' bigger than the max '${value.max}'.`,
                    );
                  }
                }
              }
            }
            // check index
            if (hasOwn(value, 'index')) {
              if (!(config.oneOf || config.max === 1)) {
                throw new Error(
                  `The target's field with a path '${path}' in instanceOptions keys is not a field with config 'oneOf' or 'max' equal to 1, can't set a 'index' value.`,
                );
              }
            }
          }
        }
      }
    }
  }
}

/**
 *
 * @param name [string]
 * @param defType [string]
 */
const warnIfEverDefinedInBuiltin = (name: string, defType: string) => {
  // warn if the short alias name or data type name is defined in builtin
  const { mockits, alias } = globalStoreData;
  if (hasOwn(mockits, name) || hasOwn(alias, name)) {
    // warn that the name in used in builtin
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: The defined ${defType} name "${name}" is a data type that has defined in builtin data types, it will override the builtin type.`,
    );
  }
};
/**
 *
 *
 * @export
 * @class Such
 */
export class Such {
  public readonly utils = utils;
  protected readonly storeData: Store;
  protected readonly hasNs: boolean;
  constructor(public readonly namespace?: string) {
    this.hasNs = !!namespace;
    if (this.hasNs) {
      this.storeData = createNsStore(namespace);
    } else {
      this.storeData = globalStoreData;
    }
  }
  /**
   *
   * assign variables for configuration
   * @param {string} name
   * @param {*} value
   * @memberof Such
   */
  public assign(
    name: string,
    value: unknown,
    assignType: boolean | AssignType = false,
  ): void {
    if (typeof assignType === 'boolean') {
      assignType = assignType ? AssignType.AlwaysVariable : AssignType.None;
    }
    this.storeData(name, value, assignType);
  }

  /**
   * get the assigned value by name
   * @param {string} name
   */
  public getAssigned(name: string): TAssignedData {
    return this.storeData.get(name);
  }

  /**
   * get store data
   * @param name
   */
  public store<T extends keyof Store>(name: T): Store[T];
  public store<T extends keyof Store>(name: Array<T>): Pick<Store, T>;
  public store<T extends keyof Store>(name: T, ...args: T[]): Pick<Store, T>;
  public store<T extends keyof Store>(
    name: T | Array<T>,
    ...args: T[]
  ): Store[T] | Pick<Store, T> {
    const { storeData } = this;
    const pick = (names: T[]): Pick<Store, T> =>
      names.reduce((ret, key: T) => {
        ret[key] = storeData[key];
        return ret;
      }, {} as Pick<Store, T>);
    if (args.length > 0) {
      return pick(args.concat(name));
    }
    if (isArray(name)) {
      return pick(name);
    }
    return storeData[name];
  }
  /**
   * clear store data
   * @param {Array<TStoreAllowedClearFileds> | TStoreAllowedClearFileds} options
   */
  public clearStore(options?: {
    reset?: boolean;
    exclude?: Array<TStoreAllowedClearFileds> | TStoreAllowedClearFileds;
  }) {
    this.storeData.clear(options);
  }
  /**
   *
   * add a parser
   * @param {string} name
   * @param {ParserConfig} config
   * @param {() => void} parse
   * @param {TObj} [setting]
   * @returns {(never | void)}
   * @memberof Such
   */
  public parser(
    name: string,
    params: {
      config: IParserConfig;
      parse: () => void;
      setting?: TObj;
    },
  ): never | void {
    // parsers can only added by root
    if (!this.hasNs) {
      const { config, parse, setting } = params;
      return Dispatcher.addParser(name, config, parse, setting);
    }
  }
  /**
   *
   *
   * @param {string} type
   * @param {string} fromType
   * @param {(string|TMFactoryOptions)} options
   * @memberof Such
   */
  public define(type: string, template: string): void | never;
  public define(type: string, enums: unknown[]): void | never;
  public define(type: string, generate: TMGenerateFn): void | never;
  public define(type: string, options: Partial<TMFactoryOptions>): void | never;
  public define(type: string, baseType: string, param: string): void | never;
  public define(
    type: string,
    baseType: string,
    options: Partial<TMFactoryOptions>,
  ): void | never;
  public define(
    type: string,
    base: TMGenerateFn | Partial<TMFactoryOptions> | unknown[] | string,
    frozen?: string | Partial<TMFactoryOptions>,
    ...args: unknown[]
  ): void | never {
    if (!dtNameRule.test(type)) {
      throw new Error(
        `Call the "define" method with a wrong type name "${type}" parameter, the type name must match the regexp rule '${dtNameRule.toString()}'`,
      );
    }
    if (!base || args.length) {
      throw new Error(
        `Wrong parameters when call the "define" method, it should provide 2 or 3 parameters, but got ${
          args.length + 3
        }`,
      );
    }
    let config: Partial<TMFactoryOptions> = {};
    // do with the config for different define types
    let isTemplate = false;
    let isEnum = false;
    const isExtend = !!frozen;
    if (isExtend) {
      if (typeof frozen === 'string') {
        if (frozen.trim() === '') {
          throw new Error(
            `The defined type "${type}" base on type "${base}" must set a param not empty.`,
          );
        }
        config = {
          param: frozen,
        };
      } else {
        config = frozen;
      }
    } else {
      if (typeof base === 'function') {
        config = {
          generate: base as TMGenerateFn,
        };
      } else if (typeof base === 'string') {
        isTemplate = true;
      } else if (isArray(base)) {
        isEnum = true;
      } else {
        config = base;
      }
    }
    const {
      param,
      init,
      generate,
      validator,
      configOptions = {},
      allowAttrs = [],
    } = config;
    const constrName = `To${capitalize(type)}`;
    // init process
    const initProcess = function (this: Mockit, genFn?: GeneratorFunction) {
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
    };
    const { mockits, alias } = this.storeData;
    if (!(hasOwn(mockits, type) || hasOwn(alias, type))) {
      let klass: TMClass;
      const { namespace, hasNs } = this;
      if (hasNs) {
        warnIfEverDefinedInBuiltin(type, 'data type');
      }
      if (isExtend) {
        const baseType = base as string;
        const realBaseType = alias[baseType] || baseType;
        const BaseClass = (hasNs
          ? mockits[realBaseType] ||
            globalStoreData.mockits[globalStoreData.alias[baseType] || baseType]
          : mockits[realBaseType]) as unknown as typeof BaseExtendMockit;
        if (!BaseClass) {
          throw new Error(
            `the defined type "${type}" what based on type of "${baseType}" is not exists.`,
          );
        }
        let lastValidator: TMParamsValidFn;
        if (isFn(validator)) {
          if (isFn(BaseClass.validator)) {
            const origValidator = BaseClass.validator;
            // inject orig validator as the last argument
            lastValidator = function (...args: unknown[]) {
              validator(...args, origValidator);
            };
          } else {
            lastValidator = validator;
          }
        }
        klass = class extends BaseClass implements Mockit {
          // set static properties
          public static readonly chainNames =
            BaseClass.chainNames.concat(realBaseType);
          public static baseType = BaseClass;
          public static readonly constrName = constrName;
          public static readonly namespace = namespace;
          public static selfConfigOptions = configOptions;
          public static configOptions = {
            ...(BaseClass.configOptions || {}),
            ...configOptions,
          };
          public static allowAttrs = allowAttrs;
          public static validator = lastValidator;
          // init
          public init() {
            super.init();
            // init
            initProcess.call(this, generate);
          }
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        if (isTemplate) {
          klass = class extends ToTemplate {
            // set static properties
            public static readonly constrName = constrName;
            public static readonly namespace = namespace;
            public static readonly allowAttrs = allowAttrs;
            public static readonly specialType = EnumSpecialType.Template;
            public static selfConfigOptions = configOptions;
            public static configOptions = configOptions;
            public static validator = validator;
            // init
            public init() {
              super.init();
              this.initTemplate();
            }
            // init template
            private initTemplate() {
              const $template = self.template(
                base as string,
                this.path,
                this.callerNamespace,
              );
              // rewrite the value method
              if ($template.params) {
                this.setParams($template.params);
              }
              this.setTemplate($template);
            }
            // generate
            public generate(options: TSuchInject): string {
              if (!this.$template) {
                this.initTemplate();
              }
              return super.generate(options);
            }
          };
        } else if (isEnum) {
          klass = class extends Mockit {
            // set static properties
            public static readonly constrName = constrName;
            public static readonly namespace = namespace;
            public static readonly allowAttrs = allowAttrs;
            public static readonly specialType = EnumSpecialType.Enum;
            public static selfConfigOptions = configOptions;
            public static configOptions = configOptions;
            public static validator = validator;
            private instance: SuchMocker;
            // init
            public init() {
              this.initInstance();
            }
            // init instance
            private initInstance() {
              this.instance = self.instance(base, {
                config: enumConfig,
              });
            }
            // generate
            public generate(options: TSuchInject): unknown {
              // the init method will only call once
              // but the generate function is cached will call by other instance
              // so here need a judgement, fix #14
              if (!this.instance) {
                this.initInstance();
              }
              if (options) {
                const instanceOptions: IAInstanceOptions = {};
                if (options.key) {
                  instanceOptions.keys = {
                    '/': options.key,
                  };
                }
                if (options.param) {
                  instanceOptions.params = {
                    '/': options.param,
                  };
                }
                return this.instance.a(instanceOptions);
              }
              return this.instance.a();
            }
            // test
            public test() {
              return true;
            }
          };
        } else {
          klass = class extends Mockit {
            // set static properties
            public static constrName = constrName;
            public static namespace = namespace;
            public static selfConfigOptions = configOptions;
            public static configOptions = configOptions;
            public static allowAttrs = allowAttrs;
            public static validator = validator;
            // init
            public init() {
              initProcess.call(this);
            }
            // call generate
            public generate(options: TSuchInject, such: Such): unknown {
              return generate.call(this, options, such);
            }
            // test
            public test() {
              return true;
            }
          };
        }
      }
      mockits[type] = klass;
    } else {
      throw new Error(`the type "${type}" has been defined yet.`);
    }
  }
  /**
   *
   *
   * @param {string} short
   * @param {string} long
   * @memberof Such
   */
  public alias(short: string, long: string): void | never {
    // alias name must be short and not equal to long
    if (
      short === '' ||
      long === '' ||
      short === long ||
      short.length > long.length
    ) {
      throw new Error(`wrong alias params:'${short}' short for '${long}'`);
    }
    // alias can only set for your own defined types
    const { aliasTypes, alias, mockits } = this.storeData;
    if (aliasTypes.includes(long)) {
      throw new Error(
        `The data type of "${long}" has an alias yet, can't use "${short}" for an alias name.`,
      );
    } else {
      // the short name must obey the dtNameRule
      if (!dtNameRule.test(short)) {
        throw new Error(
          `Use a wrong alias short name '${short}', the name should match the regexp '${dtNameRule.toString()}'`,
        );
      }
      if (!hasOwn(mockits, long)) {
        throw new Error(
          `You can't set an alias "${short}" for the data type of "${long}" which is not defined${
            this.hasNs
              ? ', you can only set alias name for your own defined types'
              : ''
          }.`,
        );
      }
      if (this.hasNs) {
        warnIfEverDefinedInBuiltin(short, 'alias');
      }
      alias[short] = long;
      aliasTypes.push(long);
    }
  }
  /**
   * load a config data
   * @param {TSuchSettings} config
   * @memberof Such
   */
  public config(config: TSuchSettings): void {
    const { parsers, types, globals, alias } = config;
    const fnHashs: TObj = {
      parsers: 'parser',
      types: 'define',
      globals: 'assign',
    };
    const lastConf: TSuchSettings = {};
    const curSuch = this as unknown as ThisType<Such> & {
      loadExtend: (files: TStrList | string) => TSuchSettings[];
    };
    if (config.extends && typeof curSuch.loadExtend === 'function') {
      curSuch.loadExtend(config.extends);
    }
    deepCopy(lastConf, {
      parsers: parsers || {},
      types: types || {},
      globals: globals || {},
      alias: alias || {},
    });
    Object.keys(lastConf).map((key: keyof TSuchSettings) => {
      const conf = lastConf[key];
      const fnName = (hasOwn(fnHashs, key) ? fnHashs[key] : key) as keyof Such;
      const fn = this[fnName] as TFunc;
      Object.keys(conf).map((name: keyof typeof conf) => {
        const value = conf[name];
        const args = utils.isArray(value)
          ? value
          : ([value] as Parameters<typeof fn>);
        fn.apply(this, [name, ...args]);
      });
    });
  }
  /**
   *
   * @param tpl
   * @returns
   */
  public template(
    code: string,
    path?: TFieldPath,
    callerNamespace?: string,
  ): Template {
    const template = new Template(code, this, path);
    const total = code.length;
    const symbol = '`';
    const tsSymbol = templateSplitor.charAt(0);
    const tsLen = templateSplitor.length;
    let curIndex = 0;
    let result = '';
    let hasEndSymbol = false;
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
        const type = '';
        let mockit: Mockit;
        let meta = '';
        let refName = '';
        let typeContext = '';
        // parse mockit until end
        while (curIndex++ < total) {
          const curCh = code.charAt(curIndex);
          if (curCh === symbol) {
            hasEndSymbol = true;
            typeContext = meta;
            if (mockit) {
              // if the mockit has initial
              // need parse again
            } else {
              let match = null;
              // if is named, get the ref name and remove the characters
              if ((match = meta.match(tmplNamedRule)) !== null) {
                refName = match[1];
                meta = meta.slice(match[0].length);
              }
              // check if match the such rule
              match = meta.match(suchRule);
              if (match) {
                const thirdNs = match[1] && match[1].replace(/\/$/, '');
                const { klass: mockitClass } = getNsMockit(
                  match[2],
                  this.namespace,
                  thirdNs,
                );
                if (mockitClass) {
                  mockit = new mockitClass(callerNamespace);
                  meta = meta.replace(match[0], '');
                  if (meta === '') {
                    // no params, only data type name
                    break;
                  } else if (meta.startsWith(splitor)) {
                    // has a splitor
                    meta = meta.slice(splitor.length);
                  }
                } else {
                  // no mockit access
                  throw new Error(
                    `[index:${storeIndex}] The data type expression in template literal \`${match[0]}\` does not exist or can't access.`,
                  );
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
            if (hasOwn(curParams, 'errorIndex')) {
              // parse error, return a wrapper data with 'errorIndex'
              // need parse to next symbol
              const errorIndex = curParams.errorIndex as unknown as number;
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
          const maybes = [
            `lack of the end symbol "${symbol}"`,
            "can't parsed correctly",
          ];
          if (hasEndSymbol) {
            maybes.reverse();
          }
          throw new Error(
            `[index:${storeIndex}] The data type expression with type :${type} in template literal, its' data attributes string "${symbol}${meta}", ${maybes.join(
              ' or ',
            )} .`,
          );
        }
        // set params if params is not empty
        if (isNoEmptyObject(params)) {
          mockit.setParams(params);
        }
        // add the mockit to segments
        template.addInstance(mockit, typeContext, refName);
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
  /**
   *
   * generate a fake data result
   * @param {*} target
   * @memberof Such
   */
  public as<T = unknown>(target: unknown, options?: IAsOptions): T {
    return this.instance<T>(target, options).a();
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
  public instance<T = unknown>(
    target: unknown,
    options?: IAsOptions,
  ): SuchMocker<T> {
    return new SuchMocker<T>(target, this, this.namespace, options);
  }

  /**
   *
   *
   * @memberof Such
   */
  public setExportType(type: string): void | never {
    if (this.namespace) {
      const { namespace } = this;
      const storeData = getNsStore(namespace);
      const { types } = storeData.exports;
      if (types.includes(type)) {
        warn(
          `The export type "${type}" has ever exported, you don't need export it again.`,
        );
      } else {
        const { alias, mockits } = storeData;
        if (!(hasOwn(mockits, type) || hasOwn(alias, type))) {
          throw new Error(
            `The export type "${type}" is not exist when you call the "setExportType", make sure you have defined the type.`,
          );
        }
        types.push(type);
      }
    } else {
      setExportWarn('setExportType', type);
    }
  }
  /**
   *
   * @param type
   */
  public setExportVar(name: string): void {
    if (this.namespace) {
      const storeData = getNsStore(this.namespace);
      const { vars } = storeData;
      if (!hasOwn(vars, name)) {
        throw new Error(
          `The export variable "${name}" is not exist when you call the "setExportVar", make sure you have assigned the variable.`,
        );
      }
      storeData.exports.vars[name] = vars[name];
    } else {
      setExportWarn('setExportVar', name);
    }
  }
  /**
   *
   * @param name
   */
  public setExportFn(name: string): void {
    if (this.namespace) {
      const storeData = getNsStore(this.namespace);
      const { fns } = storeData;
      if (!hasOwn(fns, name)) {
        throw new Error(
          `The export function "${name}" is not exist when you call the "setExportFn", make sure you have assigned the function.`,
        );
      }
      storeData.exports.fns[name] = fns[name];
    } else {
      setExportWarn('setExportVar', name);
    }
  }
}
/**
 *
 * @param namespace [string]
 * @returns Such
 */
export const createNsSuch = (namespace: string): Such => {
  return new Such(namespace);
};

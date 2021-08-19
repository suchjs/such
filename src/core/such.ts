import {
  dtNameRule,
  splitor,
  suchRule,
  templateSplitor,
  tmplMockitName,
  tmplNamedRule,
} from '../data/config';
import PathMap, { TFieldPath } from '../helpers/pathmap';
import * as utils from '../helpers/utils';
import Mockit from './mockit';
import ToTemplate from '../mockit/template';
import Dispatcher from '../data/parser';
import globalStore, { createNsStore, getNsMockit, Store } from '../data/store';
import { TFunc, TObj, TStrList, ValueOf } from '../types/common';
import { TMClass, TMFactoryOptions } from '../types/mockit';
import { TSuchSettings } from '../types/node';
import { IParserConfig } from '../types/parser';
import {
  IAInstanceOptions,
  IAsOptions,
  IMockerKeyRule,
  IMockerOptions,
  IMockerPathRuleKeys,
  TSuchInject,
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
} = utils;
/**
 *
 * @param instanceOptions [IAInstanceOptions]
 * @param path [TFieldPath]
 * @returns boolean
 */
const getOptional = (
  instanceOptions: IAInstanceOptions,
  path: TFieldPath,
  config: IMockerKeyRule,
): boolean | never => {
  const strPath = path2str(path);
  const instanceConfig = instanceOptions?.keys;
  let needReturn = false;
  let needOptional = true;
  if (instanceConfig) {
    const curConfig = instanceConfig[strPath];
    if (curConfig) {
      if (typeof curConfig.exist === 'boolean') {
        needOptional = false;
        // when not exist, just return
        needReturn = !curConfig.exist;
      } else if (!config.hasOwnProperty('min')) {
        const hasMin = curConfig.hasOwnProperty('min');
        const hasMax = curConfig.hasOwnProperty('max');
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
  path: TFieldPath,
  config: IMockerKeyRule,
): Pick<IMockerKeyRule, 'min' | 'max'> | never => {
  let { min, max } = config;
  const strPath = path2str(path);
  const instanceConfig = instanceOptions?.keys;
  if (instanceConfig) {
    const curConfig = instanceConfig[strPath];
    if (curConfig) {
      if (curConfig.hasOwnProperty('min')) {
        min = curConfig.min;
      }
      if (curConfig.hasOwnProperty('max')) {
        max = curConfig.max;
      }
    }
  }
  return {
    min,
    max,
  };
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
  public static parseKey(
    key: string,
  ): {
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
  public readonly mockFn: (dpath: TFieldPath) => unknown;
  public readonly mockit: Mockit;
  /**
   * Creates an instance of Mocker.
   * @param {IMockerOptions} options
   * @param {PathMap<Mocker>} [rootInstances]
   * @param {PathMap<any>} [rootDatas]
   * @memberof Mocker
   */
  constructor(
    options: IMockerOptions,
    such?: Such,
    namespace?: string,
    rootInstances?: PathMap<Mocker>,
    rootDatas?: PathMap<unknown>,
  ) {
    // set the mocker properties
    const { target, path, config, parent } = options;
    this.target = target;
    this.path = path;
    this.config = config || {};
    this.isRoot = path.length === 0;
    if (this.isRoot) {
      this.such = such;
      this.namespace = namespace;
      this.instances = rootInstances;
      this.datas = rootDatas;
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
    const { instances, datas } = this.root;
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
                if ((keys = this.root.instanceOptions?.keys)) {
                  const strPath = path2str(path);
                  const curConfig = keys[strPath];
                  if (curConfig && typeof curConfig.index === 'number') {
                    if (curConfig.index > totalIndex) {
                      throw new Error(
                        `The target's field with a path '${strPath}' in instanceOptions keys set a 'index' ${curConfig.index} bigger than the max index ${totalIndex}.`,
                      );
                    }
                    return curConfig.index;
                  }
                }
                return makeRandom(0, totalIndex);
              })();
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
          total =
            typeof total === 'number'
              ? total
              : (() => {
                  const { min, max } = getMinAndMax(
                    this.root.instanceOptions,
                    this.path,
                    this.config,
                  );
                  return makeRandom(min, max);
                })();
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
              const { min, max } = getMinAndMax(
                this.root.instanceOptions,
                this.path,
                this.config,
              );
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
          // e.g {"a{0,3}":["amd","cmd","umd"]}
          const makeRandArrFn = (dpath: TFieldPath, total?: number) => {
            total = !isNaN(total)
              ? Number(total)
              : (() => {
                  const { min, max } = getMinAndMax(
                    this.root.instanceOptions,
                    this.path,
                    this.config,
                  );
                  return makeRandom(min, max);
                })();
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
            const nowPath = prevPath.concat(key);
            const nowDpath = dpath.concat(key);
            if (optional) {
              const needReturn = getOptional(
                this.root.instanceOptions,
                nowPath,
                config,
              );
              // optional data
              if (needReturn) {
                return;
              }
            }
            let instance = instances.get(nowPath);
            if (!(instance instanceof Mocker)) {
              instance = new Mocker({
                target,
                config,
                path: nowPath,
                parent: this,
              });
              instances.set(nowPath, instance);
            }
            const value = instance.mock(nowDpath);
            result[key] = value;
            datas.set(nowDpath, value);
          });
          return result;
        };
      } else {
        let isMockFnOk = false;
        if (typeof target === 'string') {
          const match = target.match(suchRule);
          if (match) {
            // check if alias type, if true, point to the real type
            const { realType, klass } = getNsMockit(
              match[2],
              this.root.namespace,
              match[1],
            );
            // if the type is in mockit list, generate a mockit
            // otherwise, take it as a normal string
            if (klass) {
              this.type = realType;
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
                  this.root.such,
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
            const template = this.root.such.template(content, path);
            // set the mockit as template mockit
            this.mockit = template.mockit;
            this.mockFn = (dpath: TFieldPath) =>
              template.a({
                datas,
                dpath,
                mocker: this,
                template,
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
          const { min, max } = getMinAndMax(
            this.root.instanceOptions,
            this.path,
            this.config,
          );
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
      if (optional) {
        // check if has instance config
        const needReturn = getOptional(this.instanceOptions, [], this.config);
        if (needReturn) {
          return;
        }
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
  public meta = '';
  public mockit: Mockit;
  /**
   * constructor
   */
  constructor(public readonly context = '', public readonly such: Such) {
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
  public addInstance(instance: Mockit, refName = ''): void {
    this.segments.push(instance);
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
  public getRefValue(index: string): TemplateData | TemplateData[] {
    if (!isNaN((index as unknown) as number)) {
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
    const klass = (globalStore.mockits[
      tmplMockitName
    ] as unknown) as typeof ToTemplate;
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
      template: this,
    },
  ): unknown {
    if (!this.mockit) {
      throw new Error(`the template's mockit object is not initialized yet!`);
    }
    return this.mockit.make(options, this.such);
  }
  /**
   * @return string
   */
  public value(
    options: TSuchInject = {
      datas: null,
      dpath: [],
      mocker: null,
      template: this,
    },
  ): string {
    let index = 0;
    // clear the indexData and namedData
    // so every time get the values only generated
    const namedData: TemplateNamedData = {};
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
            if (!namedData.hasOwnProperty(refName)) {
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
          result += instanceData.result;
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
export default class SuchMocker {
  /**
   * instance properties
   */
  public readonly mocker: Mocker;
  public readonly instances: PathMap<Mocker>;
  public readonly mockits: PathMap<TObj>;
  public readonly datas: PathMap<unknown>;
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
    this.mocker = new Mocker(
      {
        target,
        path: [],
        config: options && options.config,
      },
      this.such,
      this.namespace,
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
  public a(instanceOptions?: IAInstanceOptions): unknown {
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
          if (obj.hasOwnProperty(curKey)) {
            const { config, key } = Mocker.parseKey(curKey);
            const nowPath = path.concat(key);
            // if has config
            if (isNoEmptyObject(config)) {
              ruleKeys[path2str(nowPath)] = config;
            }
            // recursive
            loop(obj[curKey], nowPath);
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
        if (keys.hasOwnProperty(path)) {
          if (!fields.hasOwnProperty(path)) {
            throw new Error(
              `The target's field with a path '${path}' in instanceOptions keys is not optional or having a length with min/max, but you set a config on it.`,
            );
          } else {
            const value = keys[path];
            const config = fields[path];
            const hasExist = typeof value.exist === 'boolean';
            // check optional
            if (hasExist && config.optional !== true) {
              throw new Error(
                `The target's field with a path '${path}' in instanceOptions keys is not optional, but you set the key 'exist' on it.`,
              );
            }
            // check count
            const hasMin = value.hasOwnProperty('min');
            const hasMax = value.hasOwnProperty('max');
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
              if (config.hasOwnProperty('min')) {
                // first use the config's min and max
                confMin = config.min;
                confMax = config.hasOwnProperty('max') ? config.max : confMin;
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
            if (value.hasOwnProperty('index')) {
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
 * BaseExtendMockit
 * Just for types
 */
class BaseExtendMockit extends Mockit {
  init(): void {
    // nothing to do
  }
  test(): boolean {
    return false;
  }
  generate(): void {
    // nothing to do
  }
}
/**
 *
 */
export class Such {
  public readonly utils = utils;
  public readonly store: Store;
  private readonly hasNs: boolean;
  constructor(private readonly namespace?: string) {
    this.hasNs = !!namespace;
    if (this.hasNs) {
      this.store = createNsStore(namespace);
    } else {
      this.store = globalStore;
    }
  }
  /**
   *
   * assign variables for configuration
   * @param {string} name
   * @param {*} value
   * @memberof Such
   */
  public assign(name: string, value: unknown, alwaysVar = false): void {
    this.store(name, value, alwaysVar);
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
  public define(type: string, ...args: unknown[]): void | never {
    if (!dtNameRule.test(type)) {
      throw new Error(
        `define a wrong type name '${type}', the name should match the regexp '${dtNameRule.toString()}'`,
      );
    }
    const argsNum = args.length;
    if (argsNum === 0 || argsNum > 2) {
      throw new Error(
        `the "define" method's arguments is not right, expect 1 or 2 argments, but got ${argsNum}`,
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
    const constrName = `To${capitalize(type)}`;
    // init process
    const initProcess = function (this: Mockit, genFn?: GeneratorFunction) {
      if (isNoEmptyObject(configOptions)) {
        this.configOptions = deepCopy({}, this.configOptions, configOptions);
      }
      if (isArray(allowAttrs)) {
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
    const { mockits } = this.store;
    const hasNs = this.hasNs;
    const isDefBuiltin = hasNs
      ? globalStore.mockits.hasOwnProperty(type)
      : false;
    if (!mockits.hasOwnProperty(type) && !isDefBuiltin) {
      let klass: TMClass;
      if (argsNum === 2) {
        const baseType = args[0] as string;
        const BaseClass = ((hasNs
          ? globalStore.mockits[baseType] || mockits[baseType]
          : mockits[baseType]) as unknown) as typeof BaseExtendMockit;
        if (!BaseClass) {
          throw new Error(
            `the defined type "${type}" what based on type of "${baseType}" is not exists.`,
          );
        }
        klass = class extends BaseClass implements Mockit {
          // set chain names
          public static chainNames = ((BaseClass as unknown) as typeof Mockit).chainNames.concat(
            baseType,
          );
          // set constructor name
          constructor() {
            super(constrName);
          }
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
          public generate(options: TSuchInject) {
            return generate.call(this, options, self);
          }
          public test() {
            return true;
          }
        };
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
    // alias can only set for your own defined types
    const { aliasTypes, alias } = this.store;
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
    const curSuch = (this as unknown) as {
      loadExtend: (files: TStrList) => TSuchSettings[];
    };
    if (config.extends && typeof curSuch.loadExtend === 'function') {
      const confFiles =
        typeof config.extends === 'string' ? [config.extends] : config.extends;
      const confs = curSuch.loadExtend(confFiles);
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
      const fnName = (fnHashs.hasOwnProperty(key)
        ? fnHashs[key]
        : key) as keyof Such;
      Object.keys(conf).map((name: keyof typeof conf) => {
        const fn = this[fnName] as TFunc;
        const args = utils.isArray(conf[name])
          ? conf[name]
          : ([conf[name]] as Parameters<typeof fn>);
        fn.apply(this, [name, ...args]);
      });
    });
  }
  /**
   *
   * @param tpl
   * @returns
   */
  public template(code: string, path?: TFieldPath): Template {
    const template = new Template(code, this);
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
        let mockit: Mockit;
        let meta = '';
        const type = '';
        let refName = '';
        // parse mockit until end
        while (curIndex++ < total) {
          const curCh = code.charAt(curIndex);
          if (curCh === symbol) {
            hasEndSymbol = true;
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
                const { klass: mockitClass } = getNsMockit(
                  match[2],
                  this.namespace,
                  match[1],
                );
                if (mockitClass) {
                  mockit = new mockitClass();
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
        template.addInstance(mockit, refName);
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
  public as(target: unknown, options?: IAsOptions): unknown {
    return this.instance(target, options).a();
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
  public instance(target: unknown, options?: IAsOptions): SuchMocker {
    return new SuchMocker(target, this, this.namespace, options);
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

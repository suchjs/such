import { TObj } from '../types/common';
import { isArray, isObject, typeOf } from './utils';
export type TFieldPathKey = string | number;
export type TFieldPath = TFieldPathKey[];
export type TFieldValue<T = unknown> = { [index: string]: T } | T[];
/**
 *
 *
 * @class PathMap
 * @template T
 */
export default class PathMap<T> {
  private result: TFieldValue<T> = null;
  private initial = false;
  constructor(public readonly isPlain: boolean) {}
  /**
   *
   *
   * @param {TFieldPath} key
   * @param {T} value
   * @returns
   * @memberof PathMap
   */
  public set(keys: TFieldPath, value: T): PathMap<T> | never {
    const valueType = typeOf(value);
    const len = keys.length;
    if (this.isPlain && (valueType === 'Array' || valueType === 'Object')) {
      return;
    }
    if (!this.initial) {
      this.result = typeof keys[0] === 'number' ? [] : {};
      this.initial = true;
    }

    let data = this.result as unknown as TFieldValue<TFieldValue>;
    if (keys.length !== 0) {
      let i = 0;
      for (; i < len - 1; i++) {
        const key = keys[i];
        const next = keys[i + 1];
        if (isArray(data) && typeof key === 'number' && key % 1 === 0) {
          if (data.length < key + 1) {
            data[key] = typeof next === 'number' ? [] : {};
          }
          data = data[key] as TFieldValue<TFieldValue>;
        } else if (isObject(data)) {
          if (!data.hasOwnProperty(key)) {
            data[key] = typeof next === 'number' ? [] : {};
          }
          data = data[key] as TFieldValue<TFieldValue>;
        } else {
          throw new Error(`wrong field path key: '${key}'`);
        }
      }
      (data as unknown as { [index: string]: T })[keys[i]] = value;
    } else {
      (this.result as TObj)[''] = value;
    }
    return this;
  }
  /**
   *
   *
   * @param {TFieldPath} key
   * @returns {T}
   * @memberof PathMap
   */
  public get(keys: TFieldPath): T {
    let result = this.result;
    if (keys.length !== 0) {
      try {
        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i];
          result = (
            typeof key === 'number'
              ? (result as T[])[key]
              : (result as TObj)[key]
          ) as TFieldValue<T>;
        }
      } catch (e) {
        // not exists
      }
      return result as unknown as T;
    }
    return (result as TObj)[''] as T;
  }
  /**
   *
   *
   * @memberof PathMap
   */
  public clear(): void {
    this.result = null;
    this.initial = false;
  }
  /**
   *
   *
   * @memberof PathMap
   */
  public has(keys: TFieldPath): boolean {
    let result = this.result;
    let flag = true;
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (typeof key === 'number') {
        flag = isArray(result) && result.length > key;
        result = (result as unknown[])[key] as TFieldValue<T>;
      } else {
        flag = isObject(result) && result.hasOwnProperty(key);
        result = (result as TObj)[key] as TFieldValue<T>;
      }
      if (!flag) {
        break;
      }
    }
    return flag;
  }
}

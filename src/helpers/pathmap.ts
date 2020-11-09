import { TObj } from '../types/common';
import { isObject, typeOf } from './utils';
export type PathKey = string | number;
export type Path = PathKey[];
export type PathValue<T> = { [index: string]: T } | T[];
/**
 *
 *
 * @class PathMap
 * @template T
 */
export default class PathMap<T> {
  private result: PathValue<T> = null;
  private initial = false;
  constructor(public readonly isPlain: boolean) {}
  /**
   *
   *
   * @param {Path} key
   * @param {T} value
   * @returns
   * @memberof PathMap
   */
  public set(keys: Path, value: T): PathMap<T> {
    const valueType = typeOf(value);
    const len = keys.length;
    if (this.isPlain && (valueType === 'Array' || valueType === 'Object')) {
      return;
    }
    if (!this.initial) {
      this.result = typeof keys[0] === 'number' ? [] : {};
      this.initial = true;
    }
    let data = this.result;
    let i = 0;
    for (; i < len - 1; i++) {
      const key = keys[i] as Path;
      const next = keys[i + 1];
      if (!data[key]) {
        data[key] = typeof next === 'number' ? [] : {};
      }
      data = data[key];
    }
    data[keys[i]] = value;
    return this;
  }
  /**
   *
   *
   * @param {Path} key
   * @returns {T}
   * @memberof PathMap
   */
  public get(keys: Path): T {
    let result = this.result;
    try {
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        result = (result as TObj)[key];
      }
    } catch (e) {
      // not exists
    }
    return result;
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
  public has(keys: Path): boolean {
    let result = this.result;
    let flag = true;
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (typeof key === 'number') {
        flag = Array.isArray(result) && result.length > key;
        result = (result as unknown[])[key] as PathValue<T>;
      } else {
        flag = isObject(result) && result.hasOwnProperty(key);
        result = (result as TObj)[key] as PathValue<T>;
      }
      if (!flag) {
        break;
      }
    }
    return flag;
  }
}

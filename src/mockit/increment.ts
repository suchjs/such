import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
import { makeRandom, validator } from '../helpers/utils';
import { TMAttrs } from '../types/mockit';
const constrName = 'ToIncrement';
const configOptions = {
  step: {
    type: Number,
    default: 1,
    validator(value: unknown): boolean | never {
      return validator.validNumber(constrName, 'step', value);
    },
  },
  start: {
    type: Number,
    default: 1,
    validator(value: unknown): boolean | never {
      return validator.validNumber(constrName, 'start', value);
    },
  },
};
export default class ToIncrement extends Mockit<number | number[]> {
  public static readonly constrName: string = constrName;
  // set config options
  public static configOptions = configOptions;
  public static selfConfigOptions = configOptions;
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // init
  public init(): void {
    // set allow data attributes
    this.setAllowAttrs('$length', '$size');
  }
  // generate
  public generate(options: TSuchInject): number | number[] {
    let { $config, $length } = this.params;
    if ($config && options.param?.$config) {
      $config = {
        ...$config,
        ...options.param.$config,
      };
    }
    if ($length && options.param?.$length) {
      $length = {
        ...$length,
        ...options.param.$length,
      };
    }
    const { start, step } = ($config || {}) as {
      start?: number;
      step?: number;
    };
    const { mocker } = options;
    const key = 'increment';
    let origValue: number = mocker.store(key) as number;
    if ($length) {
      const { least, most } = $length;
      const result: number[] = [];
      let count = makeRandom(least, most);
      if (count > 0) {
        if (typeof origValue !== 'number') {
          origValue = start;
          // push the start id
          result.push(start);
          // reduce count
          count--;
        }
        // if count still > 1
        while (count-- > 0) {
          origValue += step;
          result.push(origValue);
        }
        mocker.store(key, origValue);
      }
      return result;
    }
    if (typeof origValue === 'number') {
      origValue += step;
    } else {
      origValue = start;
    }
    mocker.store(key, origValue);
    return origValue;
  }
  public test(): boolean {
    return true;
  }
}

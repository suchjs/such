import { TMatchResult, TStrList } from '../types/common';
import { IPPSize } from '../types/parser';
import { makeRandom } from '../helpers/utils';
import Mockit from '../core/mockit';
import { TMAttrs } from '../types/mockit';
const uniRule = /^\\u([0-9a-fA-F]{1,6})$/;
const numRule = /^\d+$/;
const hex2num = (hex: string): number => {
  return parseInt(hex, 16);
};
/**
 * mock a string
 * @export
 * @class ToString
 * @extends {Mockit<string>}
 */
export default class ToString extends Mockit<string> {
  // set constructor name
  public static readonly constrName: string = 'ToString';
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // init
  public init(): void {
    // set allow data attributes
    this.setAllowAttrs('$length');
    // $size Rule
    this.addRule('$size', function ($size: IPPSize) {
      if (!$size) {
        return;
      }
      // https://www.regular-expressions.info/unicode.html#prop
      const { range } = $size;
      const total = range.length;
      if (total < 2) {
        throw new Error(`The '$size' should have 2 arguments,but got ${total}`);
      }
      // validate code range
      const [first, second] = range as TStrList;
      const result: number[][] = [];
      const maxCodeNum = 0x10ffff;
      const uniRangeRule = /^\\u([0-9a-fA-F]{1,6})\-\\u([0-9a-fA-F]{1,6})$/;
      const numRangeRule = /^(\d+)\-(\d+)$/;
      let isNormalRange = false;
      let index = 0;
      let isFirstUni = false;
      // if a normal range, has a format '[min, max]'
      // allowed syntax:
      // 1. all are numbers: [65,90]
      // 2. all are unicode: [\\u41,\\u5a]
      // mixed number and unicode are forbidden, such as [65,\\u5a]
      // once the ranges have more than 3 arguments
      // or there is at least one `range`, the single number or unicode now is just a number or unicode
      // it's not a part of range, nor the min or the max
      // e.g. [65,90-100]: contains 65,90 to 100, not 65 to 90 and 90 to 100
      if (
        total === 2 &&
        ((isFirstUni = uniRule.test(first)) || numRule.test(first))
      ) {
        let firstNum: number;
        let secondNum: number;
        let isUniRange = false;
        if (isFirstUni) {
          firstNum = hex2num(RegExp.$1);
          isUniRange = true;
          if (uniRule.test(second)) {
            isNormalRange = true;
            secondNum = hex2num(RegExp.$1);
          }
        } else {
          firstNum = Number(first);
          if (numRule.test(second)) {
            secondNum = Number(second);
            isNormalRange = true;
          }
        }
        // normal range
        if (isNormalRange) {
          if (secondNum < firstNum) {
            throw new Error(
              `the min param '${first}' is big than the max param '${second}'`,
            );
          } else {
            if (secondNum > maxCodeNum) {
              throw new Error(
                `the max param's unicode point is big than the max point (${second} > '0x10ffff')`,
              );
            } else {
              result.push([firstNum, secondNum]);
            }
          }
        } else {
          if (!numRangeRule.test(second) && !uniRangeRule.test(second)) {
            throw new Error(
              `the max param '${second}' must be a ${
                isUniRange ? 'unicode' : 'number'
              } like the min param '${first}'`,
            );
          } else {
            index++;
          }
        }
      }
      if (!isNormalRange) {
        for (; index < total; index++) {
          const code = range[index] as string;
          let match: TMatchResult | null = null;
          let firstNum: number;
          let secondNum: number;
          let isRange = true;
          if ((match = code.match(uniRangeRule))) {
            firstNum = hex2num(match[1]);
            secondNum = hex2num(match[2]);
          } else if ((match = code.match(numRangeRule))) {
            firstNum = Number(match[1]);
            secondNum = Number(match[2]);
          } else if ((match = code.match(numRule))) {
            isRange = false;
            firstNum = secondNum = Number(match[0]);
          } else if ((match = code.match(uniRule))) {
            isRange = false;
            firstNum = secondNum = hex2num(match[1]);
          } else {
            throw new Error(
              `the param of index ${index}(${code}) is a wrong range or number.`,
            );
          }
          if (isRange && secondNum < firstNum) {
            throw new Error(
              `the param of index ${index}'s range is wrong.(${match[1]} > ${match[2]})`,
            );
          } else if (secondNum > maxCodeNum) {
            throw new Error(
              `the param of index ${index}'s code point(${secondNum}) is big than 0x10ffff`,
            );
          } else {
            result.push([firstNum, secondNum]);
          }
        }
      }
      return {
        range: result,
      };
    });
  }
  // generate
  public generate(): string {
    const params = this.params;
    const { $length } = params;
    const { least, most } = $length || { least: 1, most: 100 };
    const { range } = ((params.$size as unknown) as IPPSize<number[]>) || {
      range: [[32, 126]],
    };
    const index = range.length - 1;
    const total = makeRandom(Number(least), Number(most));
    let result = '';
    for (let i = 1; i <= total; i++) {
      const idx = makeRandom(0, index);
      const [min, max] = range[idx];
      const point = makeRandom(min, max);
      result += String.fromCodePoint(point);
    }
    return result;
  }
  // test
  public test(): boolean {
    return true;
  }
}

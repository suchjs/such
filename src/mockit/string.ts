import { TMatchResult, TStrList } from '../types/common';
import { IPPSize } from '../types/parser';
import { makeRandom } from '../helpers/utils';
import Mockit from '../core/mockit';
const uniRule = /^\\u((?:[0-9a-fA-F]{4}|[0-9a-fA-F]{6}))$/;
const numRule = /^\d+$/;
const hex2num = (hex: string): number => {
  return Number('0x' + hex);
};
/**
 * mock a string
 * mock字符串
 * @export
 * @class ToString
 * @extends {Mockit<string>}
 */
export default class ToString extends Mockit<string> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init(): void {
    // Size Rule
    this.addRule('Size', function (Size: IPPSize) {
      if (!Size) {
        return;
      }
      // https://www.regular-expressions.info/unicode.html#prop
      const { range } = Size;
      if (range.length < 2) {
        throw new Error(
          `The count param should have 2 params,but got ${range.length}`,
        );
      }
      // validate code range
      const [first, second] = range as TStrList;
      const isFirstUni = uniRule.test(first);
      const result: number[][] = [];
      const maxCodeNum = 0x10ffff;
      if (isFirstUni || numRule.test(first)) {
        let firstNum: number;
        let secondNum: number;
        if (range.length > 2) {
          throw new Error(
            `the count of range should have just 2 params,if you want support some specail point code,you can set the param like this,[${first}-${first},...]`,
          );
        } else {
          if (isFirstUni) {
            firstNum = hex2num(RegExp.$1);
            if (!uniRule.test(second)) {
              throw new Error(
                `the max param "${second}" should use unicode too.`,
              );
            } else {
              secondNum = hex2num(RegExp.$1);
            }
          } else {
            firstNum = Number(first);
            if (!numRule.test(second)) {
              throw new Error(`the max param "${second}" is not a number.`);
            } else {
              secondNum = Number(second);
            }
          }
        }
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
        const uniRangeRule = /^\\u([0-9a-fA-F]{4}|[0-9a-fA-F]{6})\-\\u([0-9a-fA-F]{4}|[0-9A-Fa-f]{6})$/;
        const numRangeRule = /^(\d+)\-(\d+)$/;
        range.map((code: string, index: number) => {
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
          } else if (index > 0 && (match = code.match(numRule))) {
            isRange = false;
            firstNum = secondNum = Number(match[0]);
          } else {
            throw new Error(
              `the param of index ${index}(${code}) is a wrong range or number.`,
            );
          }
          if (isRange && secondNum < firstNum) {
            throw new Error(
              `the param of index ${index}'s range is wrong.(${match[1]} > ${match[2]})`,
            );
          }
          if (secondNum > maxCodeNum) {
            throw new Error(
              `the param of index ${index}'s code point(${secondNum}) is big than 0x10ffff`,
            );
          } else {
            result.push([firstNum, secondNum]);
          }
        });
      }
      return {
        range: result,
      };
    });
  }
  public generate(): string {
    const params = this.params;
    const { Length } = params;
    const { least, most } = Length || { least: 1, most: 100 };
    const { range } = ((params.Size as unknown) as IPPSize<number[]>) || {
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
  public test(): boolean {
    return true;
  }
}

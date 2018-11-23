import { makeRandom } from '../helpers/utils';
import { NormalObject } from '../types';
import Mockit from './namespace';

const uniRule = /^\\u((?:[0-9a-f]{2}){2,3})$/i;
const numRule = /^\d+$/;
const hex2num = (hex: string): number => {
  return Number('0x' + hex);
};
export default class ToString extends Mockit<string> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // Count Rule
    this.addRule('Count', function(Count: NormalObject) {
      // https://www.regular-expressions.info/unicode.html#prop
      const { range } = Count;
      if(range.length < 2) {
        throw new Error(`The count param should have 2 params,but got ${range.length}`);
      }
      // validate code range
      const [first, second] = range;
      const isFirstUni = uniRule.test(first);
      const result: number[][] = [];
      const maxCodeNum = 0x10ffff;
      if(isFirstUni || numRule.test(first)) {
        let firstNum: number;
        let secondNum: number;
        if(range.length > 2) {
          // tslint:disable-next-line:max-line-length
          throw new Error(`the count of range should have just 2 params,if you want support some specail point code,you can set the param like this,[${first}-${first},...]`);
        } else {
          if(isFirstUni) {
            firstNum = hex2num(RegExp.$1);
            if(!uniRule.test(second)) {
              throw new Error(`the max param "${second}" should use unicode too.`);
            } else {
              secondNum = hex2num(RegExp.$1);
            }
          } else {
            firstNum = Number(first);
            if(!numRule.test(second)) {
              throw new Error(`the max param "${second}" is not a number.`);
            } else {
              secondNum = Number(second);
            }
          }
        }
        if(secondNum < firstNum) {
          throw new Error(`the min param '${first}' is big than the max param '${second}'`);
        } else {
          if(secondNum > maxCodeNum) {
            throw new Error(`the max param's unicode point is big than the max point (${second} > '0x10ffff')`);
          } else {
            result.push([firstNum, secondNum]);
          }
        }
      } else {
        const uniRangeRule = /^\\u((?:[0-9a-f]{2}){2,3})\-\\u((?:[0-9a-f]{2}){2,3})$/i;
        const numRangeRule = /^(\d+)\-(\d+)$/;
        range.map((code: string, index: number) => {
          let match: null | any[];
          let firstNum: number;
          let secondNum: number;
          let isRange = true;
          if(match = code.match(uniRangeRule)) {
            firstNum = hex2num(match[1]);
            secondNum = hex2num(match[2]);
          } else if(match = code.match(numRangeRule)) {
            firstNum = Number(match[1]);
            secondNum = Number(match[2]);
          } else if(index > 0 && (match = code.match(numRule))) {
            isRange = false;
            firstNum = secondNum = Number(match[0]);
          } else {
            throw new Error(`the param of index ${index}(${code}) is a wrong range or number.`);
          }
          if(isRange && secondNum < firstNum) {
            throw new Error(`the param of index ${index}'s range is wrong.(${match[1]} > ${match[2]})`);
          }
          if(secondNum > maxCodeNum) {
            throw new Error(`the param of index ${index}'s code point(${secondNum}) is big than 0x10ffff`);
          } else {
            result.push([firstNum, secondNum]);
          }
        });
      }
      return {
        range: result,
      };
    });
    // Length Rule
    this.addRule('Length', function(Length: NormalObject) {
      const { least, most } = Length;
      if(isNaN(least)) {
        throw new Error(`The length param of least expect a number,but got ${least}`);
      }
      if(isNaN(most)) {
        throw new Error(`The length param of most expect a number,but got ${most}`);
      }
      if(Number(least) >  Number(most)) {
        throw new Error(`The length param of least  ${least} is big than the most ${most}`);
      }
    });
  }
  public generate() {
    const { params } = this;
    const { Length } = params;
    const { least, most } = Length || { least: 1, most: 100 };
    const { range } = params.Count || { range: [[0, 127]] };
    const index = range.length - 1;
    const total = makeRandom(Number(least), Number(most));
    let result: string = '';
    for(let i = 1; i <= total; i++) {
      const idx = makeRandom(0, index);
      const [ min, max ] = range[idx];
      const point = makeRandom(min, max);
      result += String.fromCodePoint(point);
    }
    return result;
  }
  public test() {
    return true;
  }
}

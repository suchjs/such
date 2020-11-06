import { IParserFactory, IPPLength } from '../types/parser';
import { AParser } from './namespace';

const parser: IParserFactory = {
  config: {
    startTag: ['{'],
    endTag: ['}'],
    separator: ',',
  },
  parse(this: AParser): IPPLength | never {
    const { params } = this.info();
    if (params.length > 2) {
      return this.halt('the length should not have more than 2 params');
    }
    const least = params[0];
    const most = params[params.length - 1];
    const result = { least, most };
    const valid = (key: keyof typeof result) => {
      const value = result[key];
      if (
        isNaN(Number(value)) ||
        !/^(?:[1-9]+\d*|0)$/.test(value) ||
        +value < 0
      ) {
        return this.halt(
          `the length param of ${key} expect a integer number greater than or equal to 0,but got "${value}"`,
        );
      }
    };
    valid('least');
    if (params.length === 2) {
      valid('most');
      if (Number(least) >= Number(most)) {
        throw new Error(
          `the length param of least "${least}" is greater than or equal to the most "${most}"`,
        );
      }
    }
    return {
      least: Number(least),
      most: Number(most),
    };
  },
};
export default parser;

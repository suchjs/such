import { ParamsLength, ParserInstance } from '../types';
const parser: ParserInstance = {
  config: {
    startTag: ['{'],
    endTag: ['}'],
    separator: ',',
  },
  parse(): ParamsLength | never {
    const { params } = this.info();
    if (params.length > 2) {
      return this.halt('the length should not have more than 2 params');
    }
    const least = params[0];
    const most = params[params.length - 1];
    const result = { least, most };
    const valid = (key: 'least' | 'most') => {
      const value = result[key];
      if (isNaN(value) || !/^(?:[1-9]+\d*|0)$/.test(value) || value < 0) {
        // tslint:disable-next-line:max-line-length
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
      least,
      most,
    };
  },
};
export default parser;

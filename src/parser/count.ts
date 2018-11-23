import { ParamsCount, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['['],
    endTag: [']'],
    separator: ',',
  },
  parse(): ParamsCount | never {
    const { params } = this.info();
    return {
      range: params,
    };
  },
};
export default parser;

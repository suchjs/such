import { ParamsFormat, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['%'],
    endTag: [],
  },
  parse(): ParamsFormat | never {
    const { params } = this.info();
    if(params.length !== 1) {
      return this.halt(`wrong format param:${params.join('')}`);
    }
    return {
      format: params[0],
    };
  },
};
export default parser;

import { ParamsLength, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['{'],
    endTag: ['}'],
    separator: ',',
  },
  parse(): ParamsLength | never {
    const {params} = this.info();
    if(params.length > 2) {
      return this.halt('The length should not have more than 2 params');
    }
    return {
      least: params[0],
      most: params[params.length - 1],
    };
  },
};
export default parser;

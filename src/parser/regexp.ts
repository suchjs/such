import { parserRule } from '../helpers/regexp';
import { ParamsRegexp, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['/'],
    endTag: [],
    rule: parserRule,
  },
  parse(): ParamsRegexp | never {
    const { params } = this.info();
    if(params.length !== 1) {
      return this.halt(`invalid regexp rule:${params.join('')}`);
    }
    return {
      rule: params[0],
    };
  },
};
export default parser;

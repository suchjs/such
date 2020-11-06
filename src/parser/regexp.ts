import { parserRule } from 'reregexp';
import { IParserFactory, IPPRegexp } from '../types/parser';
import { AParser } from './namespace';
const parser: IParserFactory = {
  config: {
    startTag: ['/'],
    endTag: [],
    rule: parserRule,
  },
  parse(this: AParser): IPPRegexp | never {
    const { params } = this.info();
    if (params.length !== 1) {
      return this.halt(`invalid regexp rule:${params.join('')}`);
    }
    return {
      rule: params[0],
    };
  },
};
export default parser;

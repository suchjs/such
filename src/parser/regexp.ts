import { parserRule } from 'reregexp';
import { IParserFactory, IPPRegexp } from '../types/parser';
import { AParser } from '../core/parser';
const parser: IParserFactory = {
  config: {
    startTag: ['/'],
    endTag: [],
    rule: parserRule,
  },
  parse(this: AParser): IPPRegexp | never {
    const { params } = this.info();
    return {
      rule: params[0],
    };
  },
};
export default parser;

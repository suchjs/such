import { IParserFactory, IPPSize } from '../types/parser';
import { AParser } from '../core/parser';
const parser: IParserFactory = {
  config: {
    startTag: ['['],
    endTag: [']'],
    separator: ',',
  },
  parse(this: AParser): IPPSize | never {
    const { params } = this.info();
    return {
      range: params,
    };
  },
};
export default parser;

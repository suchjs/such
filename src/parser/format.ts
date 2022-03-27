import { IParserFactory, IPPFormat } from '../types/parser';
import { AParser } from '../core/parser';
const parser: IParserFactory = {
  config: {
    startTag: ['%'],
    endTag: [],
  },
  parse(this: AParser): IPPFormat | never {
    const { params } = this.info();
    return {
      format: params[0],
    };
  },
};
export default parser;

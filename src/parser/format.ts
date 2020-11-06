import { IParserFactory, IPPFormat } from '../types/parser';
import { AParser } from './namespace';
const parser: IParserFactory = {
  config: {
    startTag: ['%'],
    endTag: [],
  },
  parse(this: AParser): IPPFormat | never {
    const { params } = this.info();
    if (params.length !== 1) {
      return this.halt(`wrong format param:${params.join('')}`);
    }
    return {
      format: params[0],
    };
  },
};
export default parser;

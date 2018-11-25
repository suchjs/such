import { encodeSplitor } from '../config';
import { ParamsPath, ParamsPathItem, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['&'],
    endTag: [],
    separator: '|',
    pattern: new RegExp(`^(\\.(?:\\/(?=\\.)|))?(\\.\\.(?:\\/(?=\\.)|))(\\/[^\\/]+)+?(?=\\||${encodeSplitor}|$)`),
    // tslint:disable-next-line:max-line-length
    rule: new RegExp(`^&(?:(?:\\.(?:\\/(?=\\.)|))?(?:\\.\\.(?:\\/(?=\\.)|))*(?:\\/(?:[^\\/]+))+?(?:\\|(?=\\/|\\.)|(?=$|${encodeSplitor})))`),
  },
  parse(): ParamsPath | never {
    const { patterns, code } = this.info();
    return [];
  },
};
export default parser;

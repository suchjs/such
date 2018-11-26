import { encodeSplitor } from '../config';
import { ParamsPath, ParamsPathItem, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['&'],
    endTag: [],
    separator: ',',
    // tslint:disable-next-line:max-line-length
    pattern: new RegExp(`^(\\.(?:\\/(?=\\.)|))?((?:\\.\\.(?:\\/(?=\\.)|))*)((?:\\/(?:\\\\.|[^,\\\\${encodeSplitor}\\/])+)+)`),
    // tslint:disable-next-line:max-line-length
    rule: new RegExp(`^&(?:(?:\\.(?:\\/(?=\\.)|))?(?:\\.\\.(?:\\/(?=\\.)|))*(?:\\/(?:\\\\.|[^,\\\\${encodeSplitor}\\/])+)+?(?:,(?=\\/|\\.)|(?=$|${encodeSplitor})))+`),
  },
  parse(): ParamsPath | never {
    const { patterns, code } = this.info();
    if(!patterns.length) {
      this.halt(`no path params found:${code}`);
    }
    const result: ParamsPath = [];
    patterns.forEach((match: any[]) => {
      const [_, lookParent, lookLevels, curPath] = match;
      const relative = !!(lookLevels || lookParent);
      const cur: ParamsPathItem = {
        relative,
        path: curPath.split('/').slice(1),
        depth: relative && lookLevels ? lookLevels.split('/').length : 0,
      };
      result.push(cur) ;
    });
    return result;
  },
};
export default parser;

import { ParamsPath, ParamsPathItem, ParserInstance } from '../types';
const parser: ParserInstance = {
  config: {
    startTag: ['&'],
    endTag: [],
    separator: ',',
    pattern: /^(\.{1,2}(?:\/\.\.)*|<\w+?>)?((?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+)/,
    // tslint:disable-next-line:max-line-length
    rule: /^&(?:(?:\.{1,2}(?:\/\.\.)*|<\w+?>)?(?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+(?=(,)|:|$)\1?)+/,
  },
  parse(): ParamsPath | never {
    const { patterns, code } = this.info();
    if (!patterns.length) {
      this.halt(`no path params found:${code}`);
    }
    const result: ParamsPath = [];
    patterns.forEach((match: any[]) => {
      const [fullpath, prefix, curPath] = match;
      const relative = !!prefix;
      const variable =
        relative && prefix.charAt(0) === '<' ? prefix.slice(1, -1) : undefined;
      let depth = 0;
      if (relative && !variable) {
        const segs = prefix.split('/');
        depth = segs.length - (segs[0] === '.' ? 1 : 0);
      }
      const cur: ParamsPathItem = {
        relative,
        path: curPath.split('/').slice(1),
        depth,
        fullpath,
        variable,
      };
      result.push(cur);
    });
    return result;
  },
};
export default parser;

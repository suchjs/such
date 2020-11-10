import { IParserFactory, IPPPath, IPPPathItem } from '../types/parser';
import { AParser } from '../core/parser';
const parser: IParserFactory = {
  config: {
    startTag: ['&'],
    endTag: [],
    separator: ',',
    pattern: /^(\.{1,2}(?:\/\.\.)*|<\w+?>)?((?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+)/,
    rule: /^&(?:(?:\.{1,2}(?:\/\.\.)*|<\w+?>)?(?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+(?=(,)|:|$)\1?)+/,
  },
  parse(this: AParser): IPPPath | never {
    const { patterns, code } = this.info();
    if (!patterns.length) {
      this.halt(`no path params found:${code}`);
    }
    const result: IPPPath = [];
    patterns.forEach((match) => {
      const [fullpath, prefix, curPath] = match;
      const relative = !!prefix;
      const variable =
        relative && prefix.charAt(0) === '<' ? prefix.slice(1, -1) : undefined;
      let depth = 0;
      if (relative && !variable) {
        const segs = prefix.split('/');
        depth = segs.length - (segs[0] === '.' ? 1 : 0);
      }
      const cur: IPPPathItem = {
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

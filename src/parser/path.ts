import { IParserFactory, IPPPath, IPPPathItem } from '../types/parser';
import { AParser } from '../core/parser';
import { encodeSplitor } from '../data/config';
import { parsePathSeg } from '../helpers/utils';
const parser: IParserFactory = {
  config: {
    startTag: ['&'],
    endTag: [],
    separator: ',',
    pattern: new RegExp(
      `^(\\.{1,2}(?:\\/\\.\\.)*|<\\w+?>)?((?:/(?:\\\\.?|[^\\/.,${encodeSplitor}]|\\.(?![.\\/,${encodeSplitor}]|$))+)+)`,
    ),
    rule: new RegExp(
      `^&(?:(?:\\.{1,2}(?:\\/\\.\\.)*|<\\w+?>)?(?:\\/(?:\\\\.?|[^\\/.,${encodeSplitor}]|\\.(?![.\\/,${encodeSplitor}]|$))+)+(?=(,)|${encodeSplitor}|$)\\1?)+`,
    ),
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
        path: parsePathSeg(curPath).slice(1),
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

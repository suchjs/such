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
      `^(\\.{1,2}(?:\\/\\.\\.)*|<\\w+?>|\\/)?((?:/(?:\\\\.?|[^\\/.,${encodeSplitor}]|\\.(?![.\\/,${encodeSplitor}]|$))+)+)`,
    ),
    rule: new RegExp(
      `^&(?:(?:\\.{1,2}(?:\\/\\.\\.)*|<\\w+?>|\\/)?(?:\\/(?:\\\\.?|[^\\/.,${encodeSplitor}]|\\.(?![.\\/,${encodeSplitor}]|$))+)+(?=(,)|${encodeSplitor}|$)\\1?)+`,
    ),
  },
  parse(this: AParser): IPPPath | never {
    const { patterns } = this.info();
    const result: IPPPath = [];
    patterns.forEach((match) => {
      const [fullpath, prefix, curPath] = match;
      const relative = !!prefix;
      let variable;
      let depth = 0;
      let fix = false;
      // do with the prefix
      if(relative){
        const firstCh = prefix.charAt(0);
        switch(firstCh){
          case '<':
            variable = prefix.slice(1, -1);
            break;
          case '.':
            depth = prefix.split('/').length - (prefix === '.' ? 1 : 0);
            break;
          case '/':
            fix = true;
            break;
        }
      }
      const cur: IPPPathItem = {
        relative,
        path: parsePathSeg(curPath).slice(1),
        depth,
        fullpath,
        variable,
        fix
      };
      result.push(cur);
    });
    return result;
  },
};
export default parser;

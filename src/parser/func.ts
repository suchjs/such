import { encodeSplitor } from '../config';
import { getExp } from '../helpers/utils';
import { NormalObject, ParamsFunc, ParserInstance } from '../types';
const parser: ParserInstance =  {
  config: {
    startTag: ['@'],
    endTag: [],
    separator: '|',
    pattern: /^([a-z][\w$]*)(?:\(((?:(?:(['"])(?:(?!\3)[^\\]|\\.)*\3|[\w$]+)\s*(?:,(?!\s*\))|(?=\s*\)))\s*)*)\)|)/,
    // tslint:disable-next-line:max-line-length
    rule: new RegExp(`^@(?:[a-z][\\w$]*(?:\\((?:(?:(['"])(?:(?!\\1)[^\\\\]|\\\\.)*\\1|[\\w$]+)\\s*(?:,(?!\\s*\\))|(?=\\s*\\)))\\s*)*\\)|)(?:\\|(?!$|${encodeSplitor})|(?=\\s*$|${encodeSplitor})))*`),
  },
  parse(): ParamsFunc | never {
    const { patterns, code } = this.info();
    if(!patterns.length) {
      this.halt(`no modify functions find in "${code}"`);
    } else {
      const rule = /(['"])((?:(?!\1)[^\\]|\\.)*)\1|([\w$]+)/g;
      const result: ParamsFunc = [];
      const nativeValues = ['true', 'false', 'undefined', 'null'];
      patterns.forEach((match: any[]) => {
        const [ _, name, args ] = match;
        const params = [];
        if(args) {
          let segs: any[] | null = null;
          while((segs = rule.exec(args)) !== null) {
            const plainValue = segs[3];
            const param: NormalObject = {};
            if(plainValue) {
              if(nativeValues.indexOf(plainValue) > -1 || !isNaN(plainValue)) {
                param.value = getExp(plainValue);
              } else {
                param.value = plainValue;
                param.variable = true;
              }
            } else {
              param.value = segs[2];
            }
            params.push(param);
          }
        }
        result.push({
          name,
          params,
        });
      });
      return result;
    }
  },
};
export default parser;

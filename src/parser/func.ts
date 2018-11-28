import { encodeSplitor } from '../config';
import { getExp } from '../helpers/utils';
import store from '../store';
import { NormalFn, NormalObject, ParamsFunc, ParamsFuncOptions, ParserInstance } from '../types';
const { fns: globalFns } = store;
const parseFuncParams = (options: ParamsFuncOptions) => {
  const { name, params } = options;
  const isUserDefined = globalFns.hasOwnProperty(name);
  const confName = '__CONFIG__';
  const varName = '__VARS__';
  const argName = '__ARGS__';
  const resName = '__RESULT__';
  const fnName = isUserDefined ? '__FN__' : `${resName}.${name}`;
  const useFnParam = isUserDefined ? [fnName] : [];
  const lastParams: string[] = isUserDefined ? [resName] : [];
  const paramValues: any[] = [];
  let index: number = 0;
  params.forEach((param: any) => {
    const { value, variable } = param;
    if(variable) {
      // tslint:disable-next-line:max-line-length
      lastParams.push(`${confName}.hasOwnProperty("${value}") ? ${confName}["${value}"] : ${varName}["${value}"]`);
    } else {
      paramValues.push(value);
      lastParams.push(`${argName}[${index++}]`);
    }
  });
  // tslint:disable-next-line:max-line-length
  return {
    // tslint:disable-next-line:max-line-length
    fn: new Function(useFnParam.concat(argName, varName, resName, confName).join(','), isUserDefined ? `return ${fnName}.apply(this,[${lastParams.join(',')}]);` : `return ${fnName}(${lastParams.join(',')})`),
    param: paramValues,
  };
};
const parser: ParserInstance =  {
  config: {
    startTag: ['@'],
    endTag: [],
    separator: '|',
    // tslint:disable-next-line:max-line-length
    pattern: /^([a-z][\w$]*)(?:\(((?:(?:(['"])(?:(?!\3)[^\\]|\\.)*\3|[\w$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)\s*(?:,(?!\s*\))|(?=\s*\)))\s*)*)\)|)/,
    // tslint:disable-next-line:max-line-length
    rule: new RegExp(`^@(?:[a-z][\\w$]*(?:\\((?:(?:(['"])(?:(?!\\1)[^\\\\]|\\\\.)*\\1|[\\w$]+(?:\\.[\\w$]+|\\[(?:(['"])(?:(?!\\2)[^\\\\]|\\.)*\\2|\\d+)\\])*)\\s*(?:,(?!\\s*\\))|(?=\\s*\\)))\\s*)*\\)|)(?:\\|(?!$|${encodeSplitor})|(?=\\s*$|${encodeSplitor})))*`),
  },
  parse(): ParamsFunc | never {
    const { patterns, code } = this.info();
    const result: ParamsFunc = {
      queue: [],
      fns: [],
      params: [],
      options: [],
    };
    if(!patterns.length) {
      this.halt(`no modify functions find in "${code}"`);
    } else {
      const rule = /(['"])((?:(?!\1)[^\\]|\\.)*)\1|([\w$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)/g;
      const nativeValues = ['true', 'false', 'undefined', 'null', 'NaN'];
      patterns.forEach((match: any[]) => {
        const [ _, name, args ] = match;
        const params = [];
        if(args) {
          let segs: any[] | null = null;
          while((segs = rule.exec(args)) !== null) {
            const plainValue = segs[3];
            const cur: NormalObject = {};
            if(plainValue) {
              if(nativeValues.indexOf(plainValue) > -1 || !isNaN(plainValue)) {
                cur.value = getExp(plainValue);
              } else {
                cur.value = plainValue;
                cur.variable = true;
              }
            } else {
              cur.value = segs[2];
            }
            params.push(cur);
          }
        }
        result.queue.push(name);
        const options = {
          name,
          params,
        };
        result.options.push(options);
        const { fn, param } = parseFuncParams(options);
        result.fns.push(fn as NormalFn);
        result.params.push(param);
      });
      return result;
    }
  },
};
export default parser;

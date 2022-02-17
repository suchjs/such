import { TFunc, TMatchResult } from '../types/common';
import {
  IParserFactory,
  IPPFunc,
  IPPFuncOptions,
  IPPFuncParam,
} from '../types/parser';
import { encodeSplitor } from '../data/config';
import { getExp } from '../helpers/utils';
import { AParser } from '../core/parser';

const parseFuncParams = (options: IPPFuncOptions) => {
  const { name, params } = options;
  const paramValues: unknown[] = [];
  params.forEach((param) => {
    const { variable, value } = param;
    if (!variable) {
      paramValues.push(value);
    }
  });
  const fn = (isUserDefined: boolean): TFunc => {
    const confName = '__CONFIG__';
    const varName = '__VARS__';
    const argName = '__ARGS__';
    const resName = '__RESULT__';
    const expName = '__EXP__';
    const fnName = isUserDefined ? '__FN__' : `${resName}.${name}`;
    const useFnParam = isUserDefined ? [fnName] : [];
    const lastParams: string[] = isUserDefined ? [resName] : [];
    let index = 0;
    params.forEach((param) => {
      const { value, variable } = param;
      if (variable) {
        const isObjChain =
          typeof value === 'string'
            ? value.includes('.') || value.includes('[')
            : false;
        lastParams.push(
          isObjChain
            ? `${expName}(${confName},"${value}")`
            : `${confName}.hasOwnProperty("${value}") ? ${confName}["${value}"] : ${varName}["${value}"]`,
        );
      } else {
        lastParams.push(`${argName}[${index++}]`);
      }
    });
    return new Function(
      useFnParam.concat(argName, varName, resName, confName, expName).join(','),
      isUserDefined
        ? `return ${fnName}.apply(this,[${lastParams.join(',')}]);`
        : `return ${fnName}(${lastParams.join(',')})`,
    ) as TFunc;
  };
  return {
    fn,
    param: paramValues,
  };
};
const parser: IParserFactory = {
  config: {
    startTag: ['@'],
    endTag: [],
    separator: '|',
    pattern:
      /^([a-z][\w$]*)(?:\(((?:(?:(['"])(?:(?!\3)[^\\]|\\.)*\3|[+-]?\d+|[a-zA-Z_$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)\s*(?:,(?!\s*\))|(?=\s*\)))\s*)*)\)|)/,
    rule: new RegExp(
      `^@(?:[a-z][\\w$]*(?:\\((?:(?:(['"])(?:(?!\\1)[^\\\\]|\\\\.)*\\1|[+-]?\\d+|[a-zA-Z_$]+(?:\\.[\\w$]+|\\[(?:(['"])(?:(?!\\2)[^\\\\]|\\.)*\\2|\\d+)\\])*)\\s*(?:,(?!\\s*\\))|(?=\\s*\\)))\\s*)*\\)|)(?:\\|(?!$|${encodeSplitor})|(?=\\s*$|${encodeSplitor})))*`,
    ),
  },
  parse(this: AParser): IPPFunc | never {
    const { patterns } = this.info();
    const result: IPPFunc = {
      queue: [],
      fns: [],
      params: [],
      options: [],
    };
    const rule =
      /(['"])((?:(?!\1)[^\\]|\\.)*)\1|([+-]?[\w$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)/g;
    const nativeValues = ['true', 'false', 'undefined', 'null', 'NaN'];
    (patterns as TMatchResult[]).forEach((match) => {
      const [, name, args] = match;
      const params: IPPFuncParam[] = [];
      if (args) {
        let segs: TMatchResult | null = null;
        while ((segs = rule.exec(args)) !== null) {
          const plainValue = segs[3];
          const cur: IPPFuncParam = {};
          if (plainValue) {
            if (
              nativeValues.indexOf(plainValue) > -1 ||
              !isNaN(Number(plainValue))
            ) {
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
      result.fns.push(fn);
      result.params.push(param);
    });
    return result;
  },
};
export default parser;

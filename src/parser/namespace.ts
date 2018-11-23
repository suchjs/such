import { encodeSplitor, splitor as confSplitor } from '../config';
import { deepLoop, encodeRegexpChars, typeOf } from '../helpers/utils';
import { NormalObject, ParserConfig } from '../types';
export interface Tags {
  start: string;
  end: string;
}
export interface ParserConstructor extends ParserConfig {
  readonly splitor?: string;
  new (): ParserInterface;
}
/**
 * 定义解析器抽象类
 *
 * @interface ParserInterface
 */
export abstract class ParserInterface {
  protected params: string[];
  protected patterns: any[][] = [];
  protected tags: Tags;
  protected code: string = '';
  protected setting: NormalObject = {
    frozen: true,
  };
  protected frozenData: NormalObject = {
    params: [],
    patterns: [],
    code: '',
    tags: {
      start: '',
      end: '',
    },
  };
  // constructor
  constructor() {
    this.init();
  }
  /**
   *
   *
   * @returns
   * @memberof ParserInterface
   */
  public init() {
    const { frozenData } = this;
    Object.keys(frozenData).forEach((key) => {
      (this as NormalObject)[key] = frozenData[key];
    });
    return this;
  }
  /**
   *
   *
   * @returns
   * @memberof ParserInterface
   */
  public info() {
    const { tags, params, code, patterns } = this;
    return {
      tags,
      params,
      code,
      patterns,
    };
  }
  /**
   *
   *
   * @param {string} code
   * @param {Tags} tags
   * @memberof ParserInterface
   */
  public parseCode(code: string, tags: Tags) {
    this.code = code;
    this.tags = tags;
    const { start, end } = tags;
    const constr = this.constructor as ParserConstructor;
    const { separator, pattern } = constr;
    if(!separator && !end) {
      this.params = [code];
    } else {
      const params = [];
      const sliceInfo = [start.length].concat(end ? -end.length : []);
      const res = code.slice(...sliceInfo);
      if(!pattern) {
        let seg = '';
        for(let i = 0, j = res.length; i < j; i++) {
          const cur = res.charAt(i);
          if(cur === '\\') {
            seg += '\\' + res.charAt(++i);
          } else {
            if(cur === separator) {
              params.push(seg);
              seg = '';
            } else {
              seg += cur;
            }
          }
        }
        if(params.length || seg) {
          params.push(seg);
        }
      } else {
        let match: any[] | null = null;
        let curCode: string = res;
        let len: number = 0;
        const total = res.length;
        while(len < total && (match = curCode.match(pattern)) !== null) {
          len += match[0].length;
          const sep = res.charAt(len);
          if(len < total && sep !== separator) {
            // tslint:disable-next-line:max-line-length
            throw new Error(`unexpected separator character "${sep}" in "${curCode.slice(len)}",expect to be "${separator}"`);
          } else {
            len += 1;
            curCode = curCode.slice(len);
            params.push(match[0]);
            pattern.lastIndex = 0;
            this.patterns.push(match);
          }
        }
      }
      this.params = params;
    }
  }
  /**
   *
   *
   * @abstract
   * @returns {Object|never}
   * @memberof ParserInterface
   */
  public abstract parse(): object | never;
  /**
   *
   *
   * @protected
   * @param {string} err
   * @returns {never}
   * @memberof ParserInterface
   */
  protected halt(err: string): never {
    throw new Error(err);
  }
}
//
export interface ParserList {
  [index: string]: ParserConstructor;
}
//
export interface ParserInstances {
  [index: string]: ParserInterface;
}
/**
 * 所有Parser的入口，分配器
 *
 * @export
 * @abstract
 * @class Dispatcher
 */
// tslint:disable-next-line:max-classes-per-file
export class Dispatcher {
  protected parsers: ParserList = {};
  protected tagPairs: string[] = [];
  protected pairHash: NormalObject = {};
  protected readonly splitor: string = confSplitor;
  protected instances: ParserInstances = {};
  /**
   *
   *
   * @param {string} name
   * @param {ParserConfig} config
   * @param {()=>void} parse
   * @returns {(never|void)}
   * @memberof Dispatcher
   */
  public addParser(name: string, config: ParserConfig, parse: () => void, setting?: NormalObject): never | void {
    const { startTag, endTag, separator, pattern } = config;
    const { splitor } = this;
    if(separator === splitor) {
      return this.halt(`the parser of "${name}" can not set '${splitor}' as separator.`);
    }
    if (this.parsers.hasOwnProperty(name)) {
      return this.halt(`the parser of "${name}" has existed.`);
    }
    if (startTag.length === 0) {
      return this.halt(`the parser of "${name}"'s startTag can not be empty. `);
    }
    if (/(\\|:|\s)/.test(startTag.concat(endTag).join(''))) {
      const char = RegExp.$1;
      return this.halt(`the parser of "${name}" contains special char (${char})`);
    }
    //
    let rule = config.rule;
    const pairs: string[] = [];
    const hasRule = endTag.length === 0 && rule instanceof RegExp;
    if(!hasRule) {
      const sortFn = (a: string, b: string) => b.length > a.length ? 1 : -1;
      startTag.sort(sortFn);
      endTag.sort(sortFn);
    }
    const startRuleSegs: string[] = [];
    const endRuleSegs: string[] = [];
    startTag.map((start) => {
      if(!hasRule) {
        startRuleSegs.push(encodeRegexpChars(start));
      }
      if (endTag.length) {
        endTag.map((end) => {
          pairs.push(start + splitor + end);
          if(!hasRule) {
            endRuleSegs.push(encodeRegexpChars(end));
          }
        });
      } else {
        pairs.push(start);
      }
    });
    // check if exists
    for (let i = 0, j = pairs.length; i < j; i++) {
      const cur = pairs[i];
      if (this.tagPairs.indexOf(cur) > -1) {
        const pair = cur.split(splitor);
        return this.halt(`the parser of "${name}"'s start tag "${pair[0]}" and end tag "${pair[1]}" has existed.`);
      } else {
        this.pairHash[cur] = name;
      }
    }
    // build rule
    if(!hasRule) {
      const hasEnd = endTag.length;
      const endWith = `(?=${encodeSplitor}|$)`;
      const startWith = `(?:${startRuleSegs.join('|')})`;
      let context: string;
      if(hasEnd) {
        const endFilter = endRuleSegs.join('|');
        context = `^${startWith}(?:\\\\.|[^\\\\](?!${endFilter})|[^\\\\])+?(?:${endFilter}${endWith})`;
      } else {
        context = `^${startWith}(?:\\\\.|[^\\\\${splitor}])+?${endWith}`;
      }
      rule = new RegExp(context);
    }
    // make sure startTag and endTag combine is unique, sort for max match.
    this.tagPairs = this.tagPairs.concat(pairs).sort((a, b) => {
      return a.length - b.length;
    });
    // tslint:disable-next-line:max-classes-per-file
    this.parsers[name] = class extends ParserInterface {
      public static readonly startTag: any[] = startTag;
      public static readonly endTag: any[] = endTag;
      public static readonly separator: string = separator || '';
      public static readonly splitor: string = splitor;
      public static readonly rule: RegExp = rule;
      public static readonly pattern: RegExp | null = pattern || null;
      constructor() {
        super();
        if(setting) {
          this.setting = Object.assign(this.setting, setting);
        }
      }
      public parse() {
        return parse.call(this);
      }
    };
  }
  /**
   *
   *
   * @param {string} code
   * @memberof Dispatcher
   */
  public parse(code: string): NormalObject | never {
    const len = code.length;
    const { splitor } = this;
    let index = 0;
    let curCode = code;
    const exists: NormalObject = {};
    const result: NormalObject = {};
    while(index < len) {
      const res: NormalObject | never = this.parseUntilFind(curCode);
      const { data, total } = res as NormalObject;
      index += total;
      if(index < len && splitor !== code.charAt(index)) {
        throw new Error(`unexpect splitor of "${code.slice(index)}",expect to be started with splitor "${splitor}"`);
      } else {
        curCode = curCode.slice(total + 1);
        index += 1;
      }
      const { instance, type } = data;
      if(exists[type] && instance.setting.frozen) {
        throw new Error(`the config of "${type}" (${instance.code}) can not be set again.`);
      } else {
        const curResult = instance.parse();
        if(typeOf(curResult) !== 'Array') {
          result[type] = {
            ...result[type] || {},
            ...curResult,
          };
        } else {
          result[type] = curResult;
        }
        exists[type] = true;
      }
    }
    return result;
  }
  /**
   *
   *
   * @protected
   * @param {string} name
   * @returns
   * @memberof Dispatcher
   */
  protected getInstance(name: string) {
    if (this.instances[name]) {
      return this.instances[name].init();
    } else {
      return this.instances[name] = new this.parsers[name]();
    }
  }
  /**
   *
   *
   * @protected
   * @param {string} context
   * @returns
   * @memberof Dispatcher
   */
  protected parseUntilFind(context: string) {
    if(context === '') {
      throw new Error('the context is empty');
    }
    const { tagPairs, pairHash, splitor, parsers } = this;
    const exactMatched: string[] = [];
    const error = `can not parse context "${context}",no parser matched.`;
    let allMatched: string[] = [];
    let startIndex = 0;
    let sub: string = '';
    let result: null | NormalObject = null;
    do {
      const cur = context.charAt(startIndex++);
      sub +=  cur;
      const total = sub.length;
      let isExactFind = false;
      allMatched = tagPairs.filter((pair) => {
        const flag = pair.indexOf(sub) === 0;
        if(flag && (pair === sub || pair.charAt(total) === splitor)) {
          isExactFind = true;
          exactMatched.push(pair);
        }
        return flag;
      });
      if(allMatched.length === 1) {
        if(!isExactFind) {
          const [ pair ] = allMatched;
          const index = pair.indexOf(splitor);
          const find = index > 0 ? pair.slice(0, index) : pair;
          if(context.indexOf(find) === 0) {
            exactMatched.push(pair);
          }
        }
        break;
      }
    } while (allMatched.length);
    let len = exactMatched.length;
    if(len) {
      const everTested: NormalObject = {};
      const tryTypes: string[] = [];
      while(len--) {
        const pair = exactMatched[len];
        const type = pairHash[pair];
        if(everTested[type]) {
          continue;
        }
        let match = null;
        const parser = parsers[type];
        const { rule } = parser;
        tryTypes.push(type);
        if(match = context.match(rule)) {
          const instance = this.getInstance(type);
          const [ start, end ] = pair.split(splitor);
          const [ param ] = match;
          try {
            instance.parseCode(param, {
              start,
              end: end || '',
            });
            result = {
              data: {
                type,
                instance,
              },
              total: param.length,
            };
            break;
          } catch(e) {
            // ignore
            everTested[type] = true;
          }
        }
      }
      if(result) {
        return result;
      } else {
        throw new Error(`${error}[tried types:${tryTypes.join(',')}]`);
      }
    } else {
      throw new Error(error);
    }
  }
  /**
   *
   *
   * @protected
   * @param {string} err
   * @returns {never}
   * @memberof Dispatcher
   */
  protected halt(err: string): never {
    throw new Error(err);
  }
}

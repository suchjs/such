import RegexpParser, { NamedGroupConf, regexpRule } from 'reregexp';
import { TMatchResult, TObj } from '../types/common';
import { IPPRegexp } from '../types/parser';
import Mockit from '../core/mockit';
export default class ToRegexp extends Mockit<string> {
  // parser
  private instance: RegexpParser;
  // set constructor name
  constructor(public readonly constrName: string = 'ToRegexp') {
    super(constrName);
  }
  // init
  public init(): void {
    // regexp rule
    this.addRule('$regexp', function ($regexp: IPPRegexp) {
      if (!$regexp) {
        throw new Error(`the regexp type must has a regexp rule.`);
      }
      const { rule } = $regexp;
      if (!regexpRule.test(rule)) {
        throw new Error('wrong regexp expression');
      }
    });
    // config rule
    this.addRule('$config', function ($config: TObj) {
      if (!$config) {
        return;
      }
      const result: TObj = {};
      const rule = /(.?)\|/g;
      Object.keys($config).forEach((key) => {
        const value = $config[key];
        if (typeof value === 'string') {
          let match: TMatchResult | null = null;
          let segs: string[] = [];
          const groups: string[] = [];
          let lastIndex = 0;
          while ((match = rule.exec(value)) !== null) {
            if (match[1] === '\\') {
              segs.push(value.slice(lastIndex, rule.lastIndex));
            } else {
              groups.push(
                segs.join('') + value.slice(lastIndex, rule.lastIndex - 1),
              );
              segs = [];
            }
            lastIndex = rule.lastIndex;
          }
          if (lastIndex < value.length) {
            groups.push(value.slice(lastIndex, value.length));
          }
          result[key] = groups;
        } else {
          result[key] = value;
        }
      });
      return result;
    });
  }
  // generate
  public generate(): string {
    let { instance } = this;
    const { $config, $regexp } = this.params;
    if (!instance) {
      instance = this.instance = new RegexpParser($regexp.rule, {
        namedGroupConf: ($config as NamedGroupConf) || {},
      });
    }
    return instance.build();
  }
  // test
  public test(): boolean {
    return true;
  }
}

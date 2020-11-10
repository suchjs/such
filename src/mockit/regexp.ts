import RegexpParser, { NamedGroupConf, regexpRule } from 'reregexp';
import { TMatchResult, TObj } from '../types/common';
import { IPPRegexp } from '../types/parser';
import Mockit from '../core/mockit';
export default class ToRegexp extends Mockit<string> {
  private instance: RegexpParser;
  constructor(constructName: string) {
    super(constructName);
  }
  public init(): void {
    // regexp rule
    this.addRule('Regexp', function (Regexp: IPPRegexp) {
      if (!Regexp) {
        throw new Error(`the regexp type must has a regexp rule.`);
      }
      const { rule } = Regexp;
      if (!regexpRule.test(rule)) {
        throw new Error('wrong regexp expression');
      }
    });
    // config rule
    this.addRule('Config', function (Config: TObj) {
      if (!Config) {
        return;
      }
      const result: TObj = {};
      const rule = /(.?)\|/g;
      Object.keys(Config).forEach((key) => {
        const value = Config[key];
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
  public generate(): string {
    let { instance } = this;
    const { Config, Regexp } = this.params;
    if (!instance) {
      instance = this.instance = new RegexpParser(Regexp.rule, {
        namedGroupConf: (Config as NamedGroupConf) || {},
      });
    }
    return instance.build();
  }
  public test(): boolean {
    return true;
  }
}

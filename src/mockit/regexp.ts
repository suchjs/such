import RegexpParser, { regexpRule } from '../helpers/regexp';
import { NormalObject, ParamsRegexp } from '../types';
import Mockit from './namespace';
export default class ToRegexp extends Mockit<string> {
  private instance: RegexpParser;
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // regexp rule
    this.addRule('Regexp', function(Regexp: ParamsRegexp) {
      const { rule } = Regexp;
      if(!regexpRule.test(rule)) {
        throw new Error('wrong regexp expression');
      }
    });
    // config rule
    this.addRule('Config', function(Config: NormalObject) {
      const result: NormalObject = {};
      const rule = /(.?)\|/g;
      Object.keys(Config).forEach((key) => {
        const value = Config[key];
        if(typeof value === 'string') {
          let match: null | any[];
          let segs: string[] = [];
          const groups: string[] = [];
          let lastIndex = 0;
          while((match = rule.exec(value)) !== null) {
            if(match[1] === '\\') {
              segs.push(value.slice(lastIndex, rule.lastIndex));
            } else {
              groups.push(segs.join('') + value.slice(lastIndex, rule.lastIndex - 1));
              segs = [];
            }
            lastIndex = rule.lastIndex;
          }
          if(lastIndex < value.length) {
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
  public generate() {
    let { instance } = this;
    const { Config, Regexp } = this.params;
    if(!instance) {
      instance = this.instance = new RegexpParser(Regexp.rule, {
        namedGroupConf: Config,
      });
    }
    return instance.build();
  }
  public test() {
    return true;
  }
}

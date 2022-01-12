import { regexpRule } from 'reregexp';
import { IParserFactory, IPPConfig } from '../types/parser';
import { decodeTrans, getExp } from '../helpers/utils';
import { AParser } from '../core/parser';
import { Variable } from '../data/config';

const parser: IParserFactory = {
  /**
   * config syntax: #[a = 1, b = 2]
   */
  config: {
    startTag: ['#['],
    endTag: [']'],
    separator: ',',
    pattern:
      /\s*([a-zA-Z_$]+)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|([^\s,\]]+))\s*)?/,
  },
  /**
   *
   * @param this [APaser]
   * @returns [IPPConfig] a config object
   */
  parse(this: AParser): IPPConfig | never {
    const { params } = this.info();
    const config: IPPConfig = {};
    if (params.length) {
      const rule =
        /^\s*([a-zA-Z_$]+)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|([^\s,\]]+))\s*)?$/;
      const nativeValues = ['true', 'false', 'null', 'undefined', 'NaN'];
      for (let i = 0, j = params.length; i < j; i++) {
        const param = params[i];
        if (rule.test(param)) {
          const { $1: key, $3: strValue, $4: plainValue } = RegExp;
          if (config.hasOwnProperty(key)) {
            throw new Error(
              `the config of "${key}" has exists,do not define repeatly.`,
            );
          }
          if (strValue) {
            config[key] = decodeTrans(strValue);
          } else if (plainValue) {
            const value = plainValue;
            if (value.charAt(0) === '/') {
              if (regexpRule.test(value)) {
                config[key] = getExp(value);
              } else {
                this.halt(`wrong regexp:${value}`);
              }
            } else if (!isNaN(Number(value))) {
              config[key] = Number(value);
            } else if (nativeValues.indexOf(value) > -1) {
              config[key] = getExp(value);
            } else {
              // variable
              config[key] = new Variable(value);
            }
          } else {
            config[key] = true;
          }
        } else {
          this.halt(
            `[index: ${i}] The configuration of "${param}" is not a valid supported value, please check it.`,
          );
        }
      }
    }
    return config;
  },
  /**
   * config won't frozen
   */
  setting: {
    frozen: false,
  },
};
export default parser;

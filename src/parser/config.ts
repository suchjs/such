import { regexpRule } from '../helpers/regexp';
import { decodeTrans, getExp } from '../helpers/utils';
import { NormalObject, ParamsConfig, ParserInstance } from '../types';

const parser: ParserInstance =  {
  config: {
    startTag: ['#['],
    endTag: [']'],
    separator: ',',
  },
  parse(): ParamsConfig | never {
    const { params } = this.info();
    const config: NormalObject = {};
    if(params.length) {
      const rule = /^\s*([$\w]+)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|(.+))\s*)?$/;
      const allowValues = ['true', 'false', 'null', 'undefined'];
      for(let i = 0, j = params.length; i < j; i++) {
        const param = params[i];
        if(rule.test(param)) {
          const { $1: key, $3: strValue, $4: plainValue } = RegExp;
          if(strValue) {
            config[key] = decodeTrans(strValue);
          } else if(plainValue) {
            const value = plainValue;
            if(value.charAt(0) === '/') {
              if(regexpRule.test(value)) {
                config[key] = getExp(value);
              } else {
                this.halt(`wrong regexp:${value}`);
              }
            } else if(!isNaN(Number(value))) {
              config[key] = Number(value);
            } else if(allowValues.indexOf(value) > -1) {
              config[key] = getExp(value);
            } else {
              this.halt(`wrong param:${param}`);
            }
          } else {
            config[key] = true;
          }
        } else {
          this.halt(`the config params of index ${i} "${param}" is wrong,please check it.`);
        }
      }
    }
    return config;
  },
  setting: {
    frozen: false,
  },
};
export default parser;

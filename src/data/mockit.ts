// mockit
import number from '../mockit/number';
import string from '../mockit/string';
import regexp from '../mockit/regexp';
import date from '../mockit/date';
import ref from '../mockit/ref';
import increment from '../mockit/increment';
import template from '../mockit/template';
import { TMClassList, TMConfigRule } from '../types/mockit';
import { IPPConfig, IPPFunc, IPPFuncOptions } from '../types/parser';
import globalStore from './store';
import { deepCopy, isArray, isFn, isObject, typeOf } from '../helpers/utils';
import { TConstructor, TObj, TStrList } from '../types/common';
import Mockit from '../core/mockit';
import { tmplMockitName } from './config';
const { vars: globalVars } = globalStore;
// all mockits
globalStore.mockits = {
  number,
  string,
  regexp,
  date,
  ref,
  increment,
  [tmplMockitName]: template,
};

// add new mockits
export const addMockitList = (mockitList: TMClassList): void => {
  Object.keys(mockitList).map((key: string) => {
    globalStore.mockits[key] = mockitList[key];
  });
};

// pre process data and methods
export const { PRE_PROCESS, isPreProcessFn, setPreProcessFn } = (function () {
  const PRE_PROCESS_STAND = '__pre_process_fn__';
  const isPreProcessFn = (fn: (...args: unknown[]) => unknown): boolean => {
    return ((fn as unknown) as TObj).hasOwnProperty(PRE_PROCESS_STAND);
  };
  const setPreProcessFn = <T = (...args: unknown[]) => unknown>(fn: T): T => {
    ((fn as unknown) as TObj)[PRE_PROCESS_STAND] = true;
    return fn;
  };
  // mockit preprocessing
  const preFuncs = {
    $func: function ($func: IPPFunc): void {
      if (!$func) {
        return;
      }
      const options = $func.options;
      for (let i = 0, j = options.length; i < j; i++) {
        const item: IPPFuncOptions = options[i];
        const { name, params } = item;
        params.map((param) => {
          // if object, valid
          if (param.variable) {
            try {
              if (typeof param.value === 'string') {
                if (param.value.includes('.') || param.value.includes('[')) {
                  new Function(
                    '__CONFIG__',
                    'return __CONFIG__.' + param.value,
                  )(globalVars);
                } else if (!globalVars.hasOwnProperty(param.value)) {
                  throw new Error(`"${param.value} is not assigned."`);
                }
              }
            } catch (e) {
              throw new Error(
                `the modifier function ${name}'s param ${param.value} is not correct:${e.message}`,
              );
            }
          }
        });
      }
    },
    $config: function (this: Mockit, $config: IPPConfig = {}): IPPConfig {
      const last = deepCopy({}, $config) as IPPConfig;
      const { configOptions } = this;
      Object.keys(configOptions).map((key: string) => {
        const cur: TMConfigRule = configOptions[key];
        let def: unknown;
        let type: TConstructor | TConstructor[];
        const typeNames: TStrList = [];
        let validator = (target: unknown) => {
          const targetType = typeOf(target);
          const allTypes = isArray(type) ? type : [type];
          let flag = false;
          allTypes.map((cur) => {
            const curName = cur.name;
            typeNames.push(curName);
            if (!flag) {
              flag = targetType === curName;
            }
          });
          return flag;
        };
        const hasKey = last.hasOwnProperty(key);
        if (isObject(cur)) {
          def = isFn(cur.default) ? cur.default() : cur.default;
          type = cur.type;
          validator = isFn<typeof validator>(cur.validator)
            ? cur.validator
            : validator;
        }
        if (!hasKey) {
          // set default
          if (def !== undefined) {
            last[key] = def;
          }
        } else {
          if (!validator.call(this, last[key])) {
            throw new Error(
              `the config of "${key}"'s value ${
                last[key]
              } is not instance of ${typeNames.join(',')}`,
            );
          }
        }
      });
      return last;
    },
  };
  return {
    PRE_PROCESS: preFuncs,
    isPreProcessFn,
    setPreProcessFn,
  };
})();

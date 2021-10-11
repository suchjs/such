import { IMockerKeyRule } from '../types/instance';
import { encodeRegexpChars } from '../helpers/utils';
export const splitor = ':';
export const templateSplitor = splitor.repeat(3);
export const encodeSplitor = encodeRegexpChars(splitor);
export const suchRule = new RegExp(
  `^${encodeSplitor}(?:@([A-Za-z][\\w$-]*\/))?([A-Za-z][\\w$-]*)`,
);
export const strRule = /^(["'])((?:(?!\1)[^\\]|\\.)*)\1$/;
// define your own data type's name rule
export const dtNameRule = /^[a-zA-Z_$][\w$]*$/;
export const tmplMockitName = 'template';
export const enumConfig: IMockerKeyRule = {
  oneOf: true,
  min: 1,
  max: 1,
};
const tmplNamedContext = '[a-zA-Z_]\\w*';
export const tmplNamedRule = new RegExp(`^<(${tmplNamedContext})>`);
export const tmplRefRule = new RegExp(
  `^\\/\\$\\{([1-9]\\d+|[0-9]|${tmplNamedContext})\\}$`,
);
// class Varaible
export class Variable {
  constructor(public readonly name: string) {}
}

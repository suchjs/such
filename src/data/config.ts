import { encodeRegexpChars } from '../helpers/utils';
export const IS_BROWSER = process.env.BROWSER;
export const splitor = ':';
export const templateSplitor = splitor.repeat(3);
export const encodeSplitor = encodeRegexpChars(splitor);
export const suchRule = new RegExp(`^${encodeSplitor}([A-Za-z][\\w$-]*)`);
export const strRule = /^(["'])((?:(?!\1)[^\\]|\\.)*)\1$/;
// define your own data type's name rule
export const dtNameRule = /^[a-zA-Z_$][\w$]*$/;
export const tmplMockitName = 'template';
export const tmplRefRule = /^\/\$\{([1-9]\d+|[0-9])\}$/;

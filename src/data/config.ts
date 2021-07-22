import { encodeRegexpChars } from '../helpers/utils';
export const splitor = ':';
export const encodeSplitor = encodeRegexpChars(splitor);
export const suchRule = new RegExp(`^${encodeSplitor}([A-Za-z][\\w$-]*)`);
export const strRule = /^(["'])((?:(?!\1)[^\\]|\\.)*)\1$/;
// define your own data type's name rule
export const dtNameRule = /^[a-zA-Z_$][\w$]*$/;

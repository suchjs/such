import { default as number } from './mockit/number';
import { default as string } from './mockit/string';
import { default as regexp } from './mockit/regexp';
import { default as date } from './mockit/date';
import { default as ref } from './mockit/ref';
import { default as id } from './mockit/id';
import Mockit from './mockit/namespace';
export type TMockitList = {
  [index: string]: new (...args: unknown[]) => Mockit;
};
export const mockitList: TMockitList = {
  number,
  string,
  regexp,
  date,
  ref,
  id,
};

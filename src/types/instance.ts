import { TObj } from 'src/types';

export interface IMockitOptions {
  param?: string;
  configOptions?: TObj;
  init?: () => void;
  generate: () => unknown;
  generateFn?: () => void;
}

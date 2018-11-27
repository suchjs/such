import * as path from 'path';
import Such from './such';
import { NormalObject } from './types';
const builtRule = /such:([a-zA-Z]+)/;
const loadConf = (name: string | string[]): NormalObject | NormalObject[] => {
  if(typeof name === 'string') {
    const isBuilt = builtRule.test(name);
    const file = isBuilt ? `./config/${RegExp.$1}` : name;
    try {
      const result = require(file);
      return isBuilt ? result.default : result;
    } catch(e) {
      // tslint:disable-next-line:no-console
      console.log(`load the file or module failure:${file}`);
    }
  } else {
    return name.map((cur: string) => {
      return loadConf(cur);
    });
  }
};
(Such as NormalObject).loadConf = loadConf;
const tryConfigFile = (...files: string[]) => {
  for(let i = 0, j = files.length; i < j; i++) {
    let filepath;
    try {
      filepath = require.resolve(files[i]);
    } catch(e) {
      continue;
    }
    return filepath;
  }
};
const filename = 'such.config.js';
const lastConfFile = tryConfigFile(path.resolve(__dirname, `../../${filename}`), path.join(process.cwd(), filename));
if(lastConfFile) {
  // tslint:disable-next-line:no-var-requires
  const conf = require(lastConfFile);
  Such.config(conf);
}
export default Such;

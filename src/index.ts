import * as fs from 'fs';
import * as path from 'path';
import { deepCopy, typeOf } from './helpers/utils';
import ToCascader from './node/mockit/cascader';
import ToDict from './node/mockit/dict';
import { getAllFiles, loadAllData, loadTemplate } from './node/utils';
import store from './store';
import Such, { ISuchConfig } from './such';
import { TObject } from './types';
const { config, fileCache } = store;
// load config files
const builtRule = /such:([a-zA-Z]+)/;
const loadConf = (name: string | string[]): TObject | TObject[] => {
  if (typeof name === 'string') {
    const isBuilt = builtRule.test(name);
    const file = isBuilt ? `./config/${RegExp.$1}` : name;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const result = require(file);
      return isBuilt ? result.default : result;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`load the file or module failure:${file}`);
    }
  } else {
    return name.map((cur: string) => {
      return loadConf(cur);
    });
  }
};
(Such as TObject).loadConf = loadConf;
// find static paths
const tryConfigFile = (...files: string[]) => {
  for (let i = 0, j = files.length; i < j; i++) {
    let filepath;
    try {
      filepath = require.resolve(files[i]);
    } catch (e) {
      filepath = undefined;
      continue;
    }
    return filepath;
  }
};
const filename = 'such.config.js';
const rootDir = path.resolve(__dirname, '../..');
const lastConfFile = tryConfigFile(
  path.join(rootDir, filename),
  path.join(process.cwd(), filename),
);
config.rootDir = lastConfFile ? path.dirname(lastConfFile) : rootDir;
// open api for reload data and clear cache
['reloadData', 'clearCache'].map((name: string) => {
  (Such as TObject)[name] = function () {
    return Promise.resolve();
  };
});
// if has config file
if (lastConfFile) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const conf = require(lastConfFile);
  if (conf.config) {
    // copy all
    deepCopy(config, conf.config);
    ['suchDir', 'dataDir'].map((key: string) => {
      if (config[key]) {
        config[key] = path.resolve(config.rootDir, config[key]);
      }
    });
    const { preload, dataDir } = config;
    if (dataDir) {
      // redefine reloadData
      (Such as TObject).reloadData = () => {
        store.fileCache = {};
        return getAllFiles(dataDir).then((files) => {
          return loadAllData(files);
        });
      };
    }
    if (preload && dataDir) {
      (async () => {
        let allFiles: string[];
        if (typeOf(preload) === 'Array') {
          allFiles = preload.map((cur: string) => {
            return path.resolve(dataDir, cur);
          });
        } else {
          allFiles = await getAllFiles(dataDir);
        }
        await loadAllData(allFiles);
        (Such as TObject).clearCache = () => {
          allFiles.map((key: string) => {
            delete fileCache[key];
          });
          return loadAllData(allFiles);
        };
      })();
    }
  }
  Such.config(conf);
}
// add node types
Such.define('dict', ToDict);
Such.define('cascader', ToCascader);
// redefine such.as,support .json file
const origSuchas = Such.as;
Such.as = function (target: unknown, options?: ISuchConfig) {
  if (typeof target === 'string' && path.extname(target) === '.json') {
    const lastPath = path.resolve(config.suchDir || config.rootDir, target);
    if (fs.existsSync(lastPath)) {
      return loadTemplate(lastPath).then((content) => {
        return origSuchas(content, options);
      });
    }
  }
  return origSuchas(target, options);
};
export default Such;

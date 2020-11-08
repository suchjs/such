import * as fs from 'fs';
import * as path from 'path';
import { deepCopy } from './helpers/utils';
import ToCascader from './node/mockit/cascader';
import ToDict from './node/mockit/dict';
import { getAllFiles, loadAllData, loadTemplate } from './node/utils';
import store from './data/store';
import Such, { IAsOptions } from './core/such';
import { TObj } from './types/common';
import { TNodeSuch } from './types/node';
const NSuch = Such as typeof Such & TNodeSuch;
const { config, fileCache } = store;
// load config files
const builtRule = /such:([a-zA-Z]+)/;
const loadConf = (name: string | string[]): TObj | TObj[] => {
  if (typeof name === 'string') {
    const isBuilt = builtRule.test(name);
    const file = isBuilt ? `./extends/${RegExp.$1}` : name;
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
      return loadConf(cur) as TObj;
    });
  }
};
NSuch.loadConf = loadConf;
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
(<const>['reloadData', 'clearCache']).map((name) => {
  NSuch[name] = function () {
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
    (<const>['suchDir', 'dataDir']).map((key) => {
      if (config[key]) {
        config[key] = path.resolve(config.rootDir, config[key]);
      }
    });
    const { preload, dataDir } = config;
    if (dataDir) {
      // redefine reloadData
      NSuch.reloadData = () => {
        store.fileCache = {};
        return getAllFiles(dataDir).then((files) => {
          return loadAllData(files);
        });
      };
    }
    if (preload && dataDir) {
      (async () => {
        let allFiles: string[];
        if (Array.isArray(preload)) {
          allFiles = preload.map((cur: string) => {
            return path.resolve(dataDir, cur);
          });
        } else {
          allFiles = await getAllFiles(dataDir);
        }
        await loadAllData(allFiles);
        NSuch.clearCache = () => {
          allFiles.map((key: string) => {
            delete fileCache[key];
          });
          return loadAllData(allFiles);
        };
      })();
    }
  }
  NSuch.config(conf);
}
// add node types
NSuch.define('dict', ToDict);
NSuch.define('cascader', ToCascader);
// redefine such.as,support .json file
const origSuchas = NSuch.as;
NSuch.as = function (target: unknown, options?: IAsOptions) {
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
export default NSuch;

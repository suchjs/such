import * as fs from 'fs';
import * as path from 'path';
import { deepCopy, isArray } from './helpers/utils';
import { getAllFiles, loadAllData, loadTemplate } from './node/utils';
import store from './data/store';
import Such from './core/such';
import { TNodeSuch, TSuchSettings } from './types/node';
import { IAsOptions } from './types/instance';
import { TPath } from './types/common';
// dict & cascader types for nodejs
import ToCascader from './node/mockit/cascader';
import ToDict from './node/mockit/dict';
const NSuch = Such as typeof Such & TNodeSuch;
const { config, fileCache } = store;
// load config files
const builtRule = /such:([a-zA-Z]+)/;
// loadExtend method
function loadExtend(name: string): TSuchSettings;
function loadExtend(name: string[]): TSuchSettings[];
function loadExtend(name: string | string[]): TSuchSettings | TSuchSettings[] {
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
      return loadExtend(cur) as TSuchSettings;
    });
  }
}
export { loadExtend };
NSuch.loadExtend = loadExtend;
NSuch.loadConf = (configFile: TPath) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const conf = require(configFile);
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
      if (isArray(preload)) {
        const allFiles: string[] = preload.map((cur: string) => {
          return path.resolve(dataDir, cur);
        });
        // load data
        NSuch.loadData = async () => {
          await loadAllData(allFiles);
        };
        NSuch.clearCache = async () => {
          allFiles.map((key: string) => {
            delete fileCache[key];
          });
          return NSuch.loadData();
        };
      } else {
        // load data
        NSuch.loadData = async () => {
          const allFiles = await getAllFiles(dataDir);
          await loadAllData(allFiles);
        };
        NSuch.clearCache = async () => {
          const allFiles = await getAllFiles(dataDir);
          allFiles.map((key: string) => {
            delete fileCache[key];
          });
          return NSuch.loadData();
        };
      }
    }
  }
  NSuch.config(conf);
};
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
(<const>['loadData', 'reloadData', 'clearCache']).map((name) => {
  NSuch[name] = function () {
    return Promise.resolve();
  };
});
// if has config file, auto load the config file
if (lastConfFile) {
  NSuch.loadConf(lastConfFile);
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

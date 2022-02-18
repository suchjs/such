import * as fs from 'fs';
import * as path from 'path';
import { deepCopy, isArray } from './helpers/utils';
import { getAllFiles, loadAllData, loadTemplate } from './node/utils';
import { Such } from './core/such';
import { TSuchSettings } from './types/node';
import { IAsOptions } from './types/instance';
import { TPath } from './types/common';
// dict & cascader types for nodejs
import ToCascader from './node/mockit/cascader';
import ToDict from './node/mockit/dict';
import { addMockitList, builtinMockits } from './data/mockit';
import { createNsSuch } from './core/such';
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
export type LoadExtendFunc = typeof loadExtend;
/**
 * Such in nodejs
 */
export class NSuch extends Such {
  public loadExtend = loadExtend;
  public async asc<T = unknown>(
    target: unknown,
    options?: IAsOptions,
  ): Promise<T> {
    const { config } = this.store;
    if (typeof target === 'string' && path.extname(target) === '.json') {
      const lastPath = path.resolve(config.suchDir || config.rootDir, target);
      if (fs.existsSync(lastPath)) {
        const content = await loadTemplate(lastPath);
        return super.as(content, options);
      }
    }
    throw new Error(
      `make sure the target is a json file and exists in suchjs config's root directory or such directory`,
    );
  }
  public loadData(): Promise<unknown> {
    return Promise.resolve();
  }
  public reloadData(): Promise<unknown> {
    return Promise.resolve();
  }
  public clearCache(): Promise<unknown> {
    return Promise.resolve();
  }
  public loadConf(configFile: TPath): void {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const conf = require(configFile);
    const { config, fileCache } = this.store;
    const rootDir = path.dirname(configFile);
    if (conf.config) {
      // copy all
      deepCopy(config, conf.config);
      (<const>['suchDir', 'dataDir']).map((key) => {
        if (config[key]) {
          config[key] = path.resolve(rootDir, config[key]);
        }
      });
      const { preload, dataDir } = config;
      if (dataDir) {
        // redefine reloadData
        this.reloadData = () => {
          this.store.fileCache = {};
          return getAllFiles(dataDir).then((files) => {
            return loadAllData(files);
          });
        };
      }
      // preload some files
      if (preload && dataDir) {
        if (isArray(preload)) {
          const allFiles: string[] = preload.map((cur: string) => {
            return path.resolve(dataDir, cur);
          });
          // load data
          this.loadData = async () => {
            await loadAllData(allFiles);
          };
          this.clearCache = async () => {
            allFiles.map((key: string) => {
              delete fileCache[key];
            });
            return this.loadData();
          };
        } else {
          // load data
          this.loadData = async () => {
            const allFiles = await getAllFiles(dataDir);
            await loadAllData(allFiles);
          };
          this.clearCache = async () => {
            const allFiles = await getAllFiles(dataDir);
            allFiles.map((key: string) => {
              delete fileCache[key];
            });
            return this.loadData();
          };
        }
      }
    }
    this.config(conf);
  }
}

// find the root directory

// config file
const tryConfigFile = () => {
  const FILENAME = 'such.config';
  const tryFiles = [`${FILENAME}.js`, `${FILENAME}.cjs`];
  const tryGetRootDir = process.env.SUCH_ROOT ? [
    // if the env variable SUCH_ROOT exist
    // 1. try find the root in the env variable SUCH_ROOT
    () => process.env.SUCH_ROOT,
  ] : [
    // 2. try find in the current work dir
    () => process.cwd(),
    // 3. try find the directory include the node_modules
    () => path.resolve(__dirname, '../..'),
  ];
  const gen = (base: TPath, file: TPath) => path.join(base, file);
  for (let i = 0, j = tryGetRootDir.length; i < j; i++) {
    const rootDir = tryGetRootDir[i]();
    for (let m = 0, n = tryFiles.length; m < n; m++) {
      try {
        const filepath = require.resolve(gen(rootDir, tryFiles[m]));
        return filepath;
      } catch (e) {
        // try the next file path
      }
    }
  }
};
const lastConfFile = tryConfigFile();
// create the root such
const root = new NSuch();
// add all builtin mockits first
addMockitList(builtinMockits);
// if has config file, autoload the config file
if (lastConfFile) {
  // load config
  root.loadConf(lastConfFile);
}
// add node types
root.define('dict', ToDict);
root.define('cascader', ToCascader);
export default {
  root,
  createNsSuch,
};

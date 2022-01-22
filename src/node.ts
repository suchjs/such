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
  public async asc<T = unknown>(target: unknown, options?: IAsOptions): Promise<T>{
    const { config } = this.store;
    if (typeof target === 'string' && path.extname(target) === '.json') {
      const lastPath = path.resolve(config.suchDir || config.rootDir, target);
      if (fs.existsSync(lastPath)) {
        const content = await loadTemplate(lastPath);
        return super.as(content, options);
      }
    }
    throw new Error(`make sure the target is a json file and exists in suchjs config's root directory or such directory`);
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
        this.reloadData = () => {
          this.store.fileCache = {};
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

const rootDir = path.resolve(__dirname, '../..');
const searchConfFilePaths = (() => {
  const filename = 'such.config';
  const cwd = process.cwd();
  const cjsFile = `${filename}.cjs`;
  const jsFile = `${filename}.js`;
  const gen = (base: TPath, file: TPath) => path.join(base, file);
  return [gen(rootDir, cjsFile), gen(cwd, cjsFile), gen(rootDir, jsFile), gen(cwd, jsFile)];
})();
const lastConfFile = tryConfigFile(...searchConfFilePaths);
// add all builtin mockits first
addMockitList(builtinMockits);
// create the root such
const root = new NSuch();
// if has config file, auto load the config file
if (lastConfFile) {
  root.store.config.rootDir = path.dirname(lastConfFile);
  root.loadConf(lastConfFile);
} else {
  root.store.config.rootDir = rootDir;
}
// add node types
root.define('dict', ToDict);
root.define('cascader', ToCascader);
export default {
  root,
  createNsSuch
};
import * as fs from 'fs';
import * as path from 'path';
import { deepCopy, hasOwn, isArray } from './helpers/utils';
import { getAllFiles, loadAllData, loadTemplate } from './node/utils';
import { Such } from './core/such';
import { TSuchSettings } from './types/node';
import { IAsOptions } from './types/instance';
import { TPath } from './types/common';
// dict & cascader types for nodejs
import ToCascader from './node/mockit/cascader';
import ToDict from './node/mockit/dict';
import { addMockitList, builtinMockits } from './data/mockit';
import globalStore from './data/store';

// load config files
const builtRule = /such:([a-zA-Z]+)/;
const globalExtends = globalStore.extends;

// loadExtend method
export type LoadExtendFunc = typeof NSuch.prototype.loadExtend;
/**
 * Such in nodejs
 */
export class NSuch extends Such {
  public loadExtend(name: string): TSuchSettings;
  public loadExtend(name: string[]): TSuchSettings[];
  public loadExtend(name: string | string[]): TSuchSettings | TSuchSettings[] {
    if (typeof name === 'string') {
      const isBuilt = builtRule.test(name);
      const file = isBuilt ? `./extends/${RegExp.$1}` : name;
      // if the extends has loaded by global such
      // ignore the extends
      if (this.hasNs && hasOwn(globalExtends, name)) {
        return globalExtends[name];
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const result = require(file);
        const config = isBuilt ? result.default : result;
        this.store.extends[name] = config;
        this.config(config);
        return config;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(`load the extended file or module failure:${file}`);
      }
    } else {
      return name.map((cur: string) => {
        return this.loadExtend(cur);
      });
    }
  }
  public async asc<T = unknown>(
    target: unknown,
    options?: IAsOptions,
  ): Promise<T> {
    const { store } = this;
    const { config } = this.store;
    const { extensions = ['.json'] } = config;
    if (
      typeof target === 'string' &&
      extensions.includes(path.extname(target))
    ) {
      const lastPath = path.resolve(config.suchDir || config.rootDir, target);
      if (fs.existsSync(lastPath)) {
        const content = await loadTemplate(lastPath, store);
        return super.as(content, options);
      }
    }
    throw new Error(
      `Make sure the target is a file with extension in "${extensions.join(
        ',',
      )}" and exists in suchjs config's root directory or "suchDir"`,
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
    const { store } = this;
    const { config, fileCache } = this.store;
    const rootDir = path.dirname(configFile);
    config.rootDir = rootDir;
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
            return loadAllData(files, store);
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
            await loadAllData(allFiles, store);
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
            await loadAllData(allFiles, store);
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
  const tryGetRootDir = process.env.SUCH_ROOT
    ? [
        // if the env variable SUCH_ROOT exist
        // 1. try find the root in the env variable SUCH_ROOT
        () => process.env.SUCH_ROOT,
      ]
    : [
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
// keep the order, add the node types first
root.define('dict', ToDict);
root.define('cascader', ToCascader);
// add all builtin mockits first
addMockitList(builtinMockits);
// if has config file, autoload the config file
if (lastConfFile) {
  // load config
  root.loadConf(lastConfFile);
}

export default {
  root,
  createNsSuch: function (namespace: string): NSuch {
    return new NSuch(namespace);
  },
};

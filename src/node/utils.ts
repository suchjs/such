import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { IPPPathItem } from '../types/parser';
import { hasOwn, typeOf } from '../helpers/utils';
import globalStoreData, {
  IFileCache,
  isFileCache,
  Store,
  TFileCacheData,
} from '../data/store';
import { TStrList } from '../types/common';

type PickStore<T extends keyof Store> = Pick<Store, T>;
type FileCacheStore = PickStore<'fileCache'>; 
type FileCacheAndConfigStore = PickStore<'fileCache'|'config'>;

export const loadDict: (
  filePath: string | TStrList,
  storeData: FileCacheStore,
  useCache?: boolean,
) => Promise<TStrList | TStrList[]> = function (
  filePath: string | TStrList,
  storeData: FileCacheStore,
  useCache = true,
) {
  const { fileCache } = storeData;
  if (typeOf(filePath) === 'Array') {
    const queues: Array<Promise<TStrList>> = [];
    (filePath as TStrList).map((curFile: string) => {
      queues.push(loadDict(curFile, storeData, useCache) as Promise<TStrList>);
    });
    return Promise.all(queues);
  }
  const lastPath = filePath as string;
  if (useCache && fileCache[lastPath]) {
    return Promise.resolve(fileCache[lastPath] as TStrList);
  } else {
    try {
      const result: TStrList = [];
      return new Promise((resolve) => {
        const rl = readline.createInterface({
          input: fs.createReadStream(lastPath),
          crlfDelay: Infinity,
        });
        rl.on('line', (code: string) => {
          result.push(code);
        });
        rl.on('close', () => {
          fileCache[lastPath] = result;
          resolve(result);
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`load dict ${filePath} failed:${e.message}`);
      return Promise.reject(e.message);
    }
  }
};
// get all files
export const getAllFiles = (directory: string): Promise<TStrList> => {
  const walk = function (
    dir: string,
    done: (err: unknown, files?: TStrList) => unknown,
  ) {
    const files: TStrList = [];
    fs.readdir(dir, function (err, list) {
      if (err) {
        return done(err);
      }
      let i = list.length;
      (function next() {
        if (i === 0) {
          return done(null, files);
        }
        const file = list[--i];
        const cur = path.join(dir, file);
        fs.stat(cur, function (_, stat) {
          if (stat && stat.isDirectory()) {
            walk(cur, done);
          } else {
            files.push(cur);
            next();
          }
        });
      })();
    });
  };
  return new Promise((resolve, reject) => {
    walk(directory, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};
// load json files
export const loadJson = (
  filePath: string | TStrList,
  storeData: FileCacheStore,
): Promise<TStrList | TStrList[]> => {
  const { fileCache } = storeData;
  if (typeOf(filePath) === 'Array') {
    const queues: Array<Promise<TStrList>> = [];
    (filePath as TStrList).map((curFile: string) => {
      queues.push(loadJson(curFile, storeData) as Promise<TStrList>);
    });
    return Promise.all(queues);
  }
  const lastPath = filePath as string;
  fileCache[lastPath] = require(lastPath);
  return Promise.resolve(fileCache[lastPath] as TStrList);
};
// load all data files
export const loadAllData = (
  allFiles: TStrList,
  storeData: FileCacheStore,
): Promise<unknown> => {
  const dictFiles: TStrList = [];
  const jsonFiles = allFiles.filter((file) => {
    if (path.extname(file) === '.json') {
      return true;
    } else {
      dictFiles.push(file);
    }
  });
  return Promise.all([loadJson(jsonFiles, storeData), loadDict(dictFiles, storeData)]);
};
// load template json
export const loadTemplate = (file: string, storeData: FileCacheStore): Promise<string> => {
  const { fileCache } = storeData;
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        if (
          fileCache[file] &&
          isFileCache(fileCache[file]) &&
          +stat.mtime === (fileCache[file] as IFileCache).mtime
        ) {
          resolve((fileCache[file] as IFileCache).content);
        } else {
          fs.readFile(file, 'utf8', (e, data) => {
            if (e) {
              reject(e);
            } else {
              let content = data;
              const isJson = path.extname(file) === '.json';
              if (isJson) {
                content = JSON.parse(data);
              }
              fileCache[file] = {
                content,
                mtime: +stat.mtime,
              };
              resolve(content);
            }
          });
        }
      }
    });
  });
};
// get real path
export const getFileCacheData = (
  item: IPPPathItem,
  storeData: FileCacheAndConfigStore,
): TFileCacheData => {
  const getDataFromCache = (storeData: FileCacheAndConfigStore) => {
    const { config, fileCache } = storeData;
    const { variable } = item;
    let { fullpath } = item;
    if (variable) {
      fullpath = fullpath.replace(
        `<${variable}>`,
        config[variable as 'dataDir' | 'rootDir'],
      );
    } else {
      fullpath = path.join(config.dataDir || config.rootDir, fullpath);
    }
    return {
      exist: hasOwn(fileCache, fullpath),
      content: fileCache[fullpath],
    };
  };
  const { exist, content } = getDataFromCache(storeData);
  if (!exist && storeData !== globalStoreData) {
    return getDataFromCache(globalStoreData).content;
  }
  return content;
};

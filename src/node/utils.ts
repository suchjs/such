import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { IPPPathItem } from '../types/parser';
import { isArray, isObject, makeRandom, typeOf } from '../helpers/utils';
import store, { IFileCache, isFileCache } from '../data/store';
import { TStrList } from '../types/common';
const { fileCache, config } = store;

export const loadDict: (
  filePath: string | TStrList,
  useCache?: boolean,
) => Promise<TStrList | TStrList[]> = function (
  filePath: string | TStrList,
  useCache = true,
) {
  if (typeOf(filePath) === 'Array') {
    const queues: Array<Promise<TStrList>> = [];
    (filePath as TStrList).map((curFile: string) => {
      queues.push(loadDict(curFile) as Promise<TStrList>);
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
    done: (err: unknown, results?: TStrList) => unknown,
  ) {
    let results: TStrList = [];
    fs.readdir(dir, function (err, list) {
      if (err) {
        return done(err);
      }
      let i = list.length;
      (function next() {
        if (i === 0) {
          return done(null, results);
        }
        const file = list[--i];
        const cur = path.join(dir, file);
        fs.stat(cur, function (_, stat) {
          if (stat && stat.isDirectory()) {
            walk(cur, function (__, res) {
              results = results.concat(res);
              next();
            });
          } else {
            results.push(cur);
            next();
          }
        });
      })();
    });
  };
  return new Promise((resolve, reject) => {
    walk(directory, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
// load json files
export const loadJson = (
  filePath: string | TStrList,
): Promise<TStrList | TStrList[]> => {
  if (typeOf(filePath) === 'Array') {
    const queues: Array<Promise<TStrList>> = [];
    (filePath as TStrList).map((curFile: string) => {
      queues.push(loadJson(curFile) as Promise<TStrList>);
    });
    return Promise.all(queues);
  }
  const lastPath = filePath as string;
  fileCache[lastPath] = require(lastPath);
  return Promise.resolve(fileCache[lastPath] as TStrList);
};
// load all data files
export const loadAllData = (allFiles: TStrList): Promise<unknown> => {
  const dictFiles: TStrList = [];
  const jsonFiles = allFiles.filter((file) => {
    if (path.extname(file) === '.json') {
      return true;
    } else {
      dictFiles.push(file);
    }
  });
  return Promise.all([loadJson(jsonFiles), loadDict(dictFiles)]);
};
// load template json
export const loadTemplate = (file: string): Promise<string> => {
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
              const content = JSON.parse(data);
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
export const getRealPath = (item: IPPPathItem): string => {
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
  return fullpath;
};
// default cascader handle
export const getCascaderValue = (
  data: unknown,
  values: TStrList,
): unknown | never => {
  const len = values.length;
  let i = 0;
  while (i < len) {
    const cur = values[i++];
    if (isObject(data)) {
      data = data[cur];
    } else {
      throw new Error(`${values.slice(0, i).join('.')}字段路径没有找到`);
    }
  }
  if (isArray(data)) {
    const index = makeRandom(0, data.length - 1);
    return data[index];
  } else {
    const keys = Object.keys(data);
    const index = makeRandom(0, keys.length - 1);
    return keys[index];
  }
};

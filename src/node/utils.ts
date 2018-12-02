import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { typeOf } from '../helpers/utils';
import store from '../store';
const { fileCache, config } = store;

// tslint:disable-next-line:max-line-length
export const loadDict: (filePath: string | string[], useCache?: boolean) => Promise<string[] | string[][]> = function(filePath: string | string[], useCache: boolean = true) {
  if(typeOf(filePath) === 'Array') {
    const queues: Array<Promise<string[]>> = [];
    (filePath as string[]).map((curFile: string) => {
      queues.push(loadDict(curFile) as Promise<string[]>);
    });
    return Promise.all(queues);
  }
  const lastPath = filePath  as string;
  if(useCache && fileCache[lastPath]) {
    return Promise.resolve(fileCache[lastPath]);
  } else {
    try {
      const result: string[] = [];
      return new Promise((resolve, reject) => {
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
    } catch(e) {
      // tslint:disable-next-line:no-console
      console.error(`load dict ${filePath} failed:${e.message}`);
      return Promise.reject(e.message);
    }
  }
};
// get all files
export const getAllFiles = (directory: string): Promise<string[]> => {
  const walk = function(dir: string, done: (err: any, results?: string[]) => any) {
    let results: string[] = [];
    fs.readdir(dir, function(err, list) {
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
        fs.stat(cur, function(_, stat) {
          if (stat && stat.isDirectory()) {
            walk(cur, function(__, res) {
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
      if(err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};
// load json files
export const loadJson = (filePath: string | string[]): Promise<string[] | string[][]> => {
  if(typeOf(filePath) === 'Array') {
    const queues: Array<Promise<string[]>> = [];
    (filePath as string[]).map((curFile: string) => {
      queues.push(loadJson(curFile) as Promise<string[]>);
    });
    return Promise.all(queues);
  }
  const lastPath = filePath  as string;
  fileCache[lastPath] = require(lastPath);
  return Promise.resolve(fileCache[lastPath]);
};
// load all data files
export const loadAllData = (allFiles: string[]) => {
  const dictFiles: string[] = [];
  const jsonFiles = allFiles.filter((file) => {
    if(path.extname(file) === '.json') {
      return true;
    } else {
      dictFiles.push(file);
    }
  });
  return Promise.all([loadJson(jsonFiles), loadDict(dictFiles)] ) ;
};
// load template json
export const loadTemplate = (file: string) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stat) => {
      if(err) {
        reject(err);
      } else {
        if(fileCache[file] && stat.mtime === fileCache[file].mtime) {
          resolve(fileCache[file].content);
        } else {
          fs.readFile(file, 'utf8', (e, data) => {
            if(e) {
              reject(e);
            } else {
              const content = JSON.parse(data);
              fileCache[file] = {
                content,
                mtime: stat.mtime,
              };
              resolve(content);
            }
          });
        }
      }
    });
  });
};

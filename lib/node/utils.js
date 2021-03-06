"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCascaderValue = exports.getRealPath = exports.loadTemplate = exports.loadAllData = exports.loadJson = exports.getAllFiles = exports.loadDict = void 0;
var fs = require("fs");
var path = require("path");
var readline = require("readline");
var utils_1 = require("../helpers/utils");
var store_1 = require("../data/store");
var fileCache = store_1.default.fileCache, config = store_1.default.config;
exports.loadDict = function (filePath, useCache) {
    if (useCache === void 0) { useCache = true; }
    if (utils_1.typeOf(filePath) === 'Array') {
        var queues_1 = [];
        filePath.map(function (curFile) {
            queues_1.push(exports.loadDict(curFile));
        });
        return Promise.all(queues_1);
    }
    var lastPath = filePath;
    if (useCache && fileCache[lastPath]) {
        return Promise.resolve(fileCache[lastPath]);
    }
    else {
        try {
            var result_1 = [];
            return new Promise(function (resolve) {
                var rl = readline.createInterface({
                    input: fs.createReadStream(lastPath),
                    crlfDelay: Infinity,
                });
                rl.on('line', function (code) {
                    result_1.push(code);
                });
                rl.on('close', function () {
                    fileCache[lastPath] = result_1;
                    resolve(result_1);
                });
            });
        }
        catch (e) {
            console.error("load dict " + filePath + " failed:" + e.message);
            return Promise.reject(e.message);
        }
    }
};
exports.getAllFiles = function (directory) {
    var walk = function (dir, done) {
        var results = [];
        fs.readdir(dir, function (err, list) {
            if (err) {
                return done(err);
            }
            var i = list.length;
            (function next() {
                if (i === 0) {
                    return done(null, results);
                }
                var file = list[--i];
                var cur = path.join(dir, file);
                fs.stat(cur, function (_, stat) {
                    if (stat && stat.isDirectory()) {
                        walk(cur, function (__, res) {
                            results = results.concat(res);
                            next();
                        });
                    }
                    else {
                        results.push(cur);
                        next();
                    }
                });
            })();
        });
    };
    return new Promise(function (resolve, reject) {
        walk(directory, function (err, results) {
            if (err) {
                reject(err);
            }
            else {
                resolve(results);
            }
        });
    });
};
exports.loadJson = function (filePath) {
    if (utils_1.typeOf(filePath) === 'Array') {
        var queues_2 = [];
        filePath.map(function (curFile) {
            queues_2.push(exports.loadJson(curFile));
        });
        return Promise.all(queues_2);
    }
    var lastPath = filePath;
    fileCache[lastPath] = require(lastPath);
    return Promise.resolve(fileCache[lastPath]);
};
exports.loadAllData = function (allFiles) {
    var dictFiles = [];
    var jsonFiles = allFiles.filter(function (file) {
        if (path.extname(file) === '.json') {
            return true;
        }
        else {
            dictFiles.push(file);
        }
    });
    return Promise.all([exports.loadJson(jsonFiles), exports.loadDict(dictFiles)]);
};
exports.loadTemplate = function (file) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (err, stat) {
            if (err) {
                reject(err);
            }
            else {
                if (fileCache[file] &&
                    store_1.isFileCache(fileCache[file]) &&
                    +stat.mtime === fileCache[file].mtime) {
                    resolve(fileCache[file].content);
                }
                else {
                    fs.readFile(file, 'utf8', function (e, data) {
                        if (e) {
                            reject(e);
                        }
                        else {
                            var content = JSON.parse(data);
                            fileCache[file] = {
                                content: content,
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
exports.getRealPath = function (item) {
    var variable = item.variable;
    var fullpath = item.fullpath;
    if (variable) {
        fullpath = fullpath.replace("<" + variable + ">", config[variable]);
    }
    else {
        fullpath = path.join(config.dataDir || config.rootDir, fullpath);
    }
    return fullpath;
};
exports.getCascaderValue = function (data, values) {
    var len = values.length;
    var i = 0;
    while (i < len) {
        var cur = values[i++];
        if (utils_1.isObject(data)) {
            data = data[cur];
        }
        else {
            throw new Error(values.slice(0, i).join('.') + "\u5B57\u6BB5\u8DEF\u5F84\u6CA1\u6709\u627E\u5230");
        }
    }
    if (Array.isArray(data)) {
        var index = utils_1.makeRandom(0, data.length - 1);
        return data[index];
    }
    else {
        var keys = Object.keys(data);
        var index = utils_1.makeRandom(0, keys.length - 1);
        return keys[index];
    }
};
//# sourceMappingURL=utils.js.map
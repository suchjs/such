"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConf = void 0;
var fs = require("fs");
var path = require("path");
var utils_1 = require("./helpers/utils");
var cascader_1 = require("./node/mockit/cascader");
var dict_1 = require("./node/mockit/dict");
var utils_2 = require("./node/utils");
var store_1 = require("./data/store");
var such_1 = require("./core/such");
var NSuch = such_1.default;
var config = store_1.default.config, fileCache = store_1.default.fileCache;
var builtRule = /such:([a-zA-Z]+)/;
function loadConf(name) {
    if (typeof name === 'string') {
        var isBuilt = builtRule.test(name);
        var file = isBuilt ? "./extends/" + RegExp.$1 : name;
        try {
            var result = require(file);
            return isBuilt ? result.default : result;
        }
        catch (e) {
            console.log("load the file or module failure:" + file);
        }
    }
    else {
        return name.map(function (cur) {
            return loadConf(cur);
        });
    }
}
exports.loadConf = loadConf;
NSuch.loadConf = loadConf;
var tryConfigFile = function () {
    var files = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        files[_i] = arguments[_i];
    }
    for (var i = 0, j = files.length; i < j; i++) {
        var filepath = void 0;
        try {
            filepath = require.resolve(files[i]);
        }
        catch (e) {
            filepath = undefined;
            continue;
        }
        return filepath;
    }
};
var filename = 'such.config.js';
var rootDir = path.resolve(__dirname, '../..');
var lastConfFile = tryConfigFile(path.join(rootDir, filename), path.join(process.cwd(), filename));
config.rootDir = lastConfFile ? path.dirname(lastConfFile) : rootDir;
['reloadData', 'clearCache'].map(function (name) {
    NSuch[name] = function () {
        return Promise.resolve();
    };
});
if (lastConfFile) {
    var conf = require(lastConfFile);
    if (conf.config) {
        utils_1.deepCopy(config, conf.config);
        ['suchDir', 'dataDir'].map(function (key) {
            if (config[key]) {
                config[key] = path.resolve(config.rootDir, config[key]);
            }
        });
        var preload_1 = config.preload, dataDir_1 = config.dataDir;
        if (dataDir_1) {
            NSuch.reloadData = function () {
                store_1.default.fileCache = {};
                return utils_2.getAllFiles(dataDir_1).then(function (files) {
                    return utils_2.loadAllData(files);
                });
            };
        }
        if (preload_1 && dataDir_1) {
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                var allFiles;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!Array.isArray(preload_1)) return [3, 1];
                            allFiles = preload_1.map(function (cur) {
                                return path.resolve(dataDir_1, cur);
                            });
                            return [3, 3];
                        case 1: return [4, utils_2.getAllFiles(dataDir_1)];
                        case 2:
                            allFiles = _a.sent();
                            _a.label = 3;
                        case 3: return [4, utils_2.loadAllData(allFiles)];
                        case 4:
                            _a.sent();
                            NSuch.clearCache = function () {
                                allFiles.map(function (key) {
                                    delete fileCache[key];
                                });
                                return utils_2.loadAllData(allFiles);
                            };
                            return [2];
                    }
                });
            }); })();
        }
    }
    NSuch.config(conf);
}
NSuch.define('dict', dict_1.default);
NSuch.define('cascader', cascader_1.default);
var origSuchas = NSuch.as;
NSuch.as = function (target, options) {
    if (typeof target === 'string' && path.extname(target) === '.json') {
        var lastPath = path.resolve(config.suchDir || config.rootDir, target);
        if (fs.existsSync(lastPath)) {
            return utils_2.loadTemplate(lastPath).then(function (content) {
                return origSuchas(content, options);
            });
        }
    }
    return origSuchas(target, options);
};
exports.default = NSuch;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var utils_1 = require("../../helpers/utils");
var store_1 = require("../../store");
var utils_2 = require("../utils");
var config = store_1.default.config, fileCache = store_1.default.fileCache;
exports.default = {
    configOptions: {
        count: {
            type: Number,
            validator: function (target) {
                return typeof target === 'number' && target > 0 && target % 1 === 0;
            },
            default: 1,
        },
    },
    init: function () {
        this.addRule('Path', function (Path) {
            if (!Path) {
                throw new Error("the dict type must have a path.");
            }
        });
    },
    generate: function () {
        var _a = this.params, Path = _a.Path, Config = _a.Config;
        var isSync = config.preload === true || (utils_1.typeOf(config.preload) === 'Array' && Path.every(function (item) { return config.preload.indexOf(item.fullpath) > -1; }));
        var makeOne = function (result) {
            var dict = result[utils_1.makeRandom(0, result.length - 1)];
            return dict[utils_1.makeRandom(0, dict.length - 1)];
        };
        var makeAll = function (result) {
            var count = Config.count || 1;
            var one = count === 1;
            var last = [];
            while (count--) {
                last.push(makeOne(result));
            }
            return one ? last[0] : last;
        };
        var lastPaths = Path.map(function (item) {
            var variable = item.variable;
            var fullpath = item.fullpath;
            if (variable) {
                fullpath = fullpath.replace("<" + variable + ">", config[variable]);
            }
            else {
                fullpath = path.resolve(config.dataDir || config.rootDir, fullpath);
            }
            return fullpath;
        });
        if (isSync) {
            var queues_1 = [];
            lastPaths.map(function (filePath) {
                queues_1.push(fileCache[filePath]);
            });
            return makeAll(queues_1);
        }
        else {
            return utils_2.loadDict(lastPaths).then(function (result) {
                return makeAll(result);
            });
        }
    },
};
//# sourceMappingURL=dict.js.map
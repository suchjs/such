"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../helpers/utils");
var store_1 = require("../../data/store");
var utils_2 = require("../utils");
var config = store_1.default.config, fileCache = store_1.default.fileCache;
exports.default = {
    init: function () {
        this.addRule('Path', function (Path) {
            if (!Path) {
                throw new Error('the dict type must have a path param.');
            }
            else {
                Path.every(function (item) {
                    if (item.depth > 0) {
                        throw new Error("the dict type of path \"" + item.fullpath + "\" is not based on rootDir.");
                    }
                    return true;
                });
            }
        });
    },
    generate: function () {
        var _a = this.params, Path = _a.Path, Length = _a.Length;
        var preload = config.preload;
        var isSync = false;
        if (typeof preload === 'boolean') {
            isSync = preload === true;
        }
        else if (Array.isArray(config.preload)) {
            isSync = Path.every(function (item) {
                return preload.includes(item.fullpath);
            });
        }
        var makeOne = function (result) {
            var dict = result[utils_1.makeRandom(0, result.length - 1)];
            return dict[utils_1.makeRandom(0, dict.length - 1)];
        };
        var makeAll = function (result) {
            var count = Length ? utils_1.makeRandom(Length.least, Length.most) : 1;
            var one = count === 1;
            var last = [];
            while (count--) {
                last.push(makeOne(result));
            }
            return one ? last[0] : last;
        };
        var lastPaths = Path.map(function (item) {
            return utils_2.getRealPath(item);
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
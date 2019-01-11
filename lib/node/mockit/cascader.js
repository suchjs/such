"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../helpers/utils");
var store_1 = require("../../store");
var utils_2 = require("../utils");
var config = store_1.default.config, fileCache = store_1.default.fileCache;
exports.default = {
    configOptions: {
        root: {
            type: Boolean,
            default: false,
        },
        handle: {
            type: Function,
        },
    },
    init: function () {
        this.addRule('Path', function (Path) {
            if (!Path) {
                throw new Error('the cascader type must have a path or ref.');
            }
            else if (Path.length !== 1) {
                throw new Error('the cascader type must have an only path or ref.');
            }
        });
    },
    generate: function (options) {
        var mocker = options.mocker;
        var _a = this.params, Path = _a.Path, Config = _a.Config;
        var lastPath = Path[0];
        var handle = Config.handle;
        var values = [];
        var loop = 1;
        while (!Config.root && loop++ < 10) {
            var refMocker = utils_1.getRefMocker(lastPath, mocker);
            var mockit = refMocker.mockit;
            var params = mockit.params;
            Path = params.Path;
            Config = params.Config;
            lastPath = Path[0];
            handle = handle || Config.handle;
            values.unshift(refMocker.result);
        }
        handle = handle || utils_2.getCascaderValue;
        var isSync = config.preload === true || (utils_1.typeOf(config.preload) === 'Array' && config.preload.indexOf(lastPath.fullpath) > -1);
        var realPath = utils_2.getRealPath(lastPath);
        if (isSync) {
            var data = fileCache[realPath];
            return handle(data, values);
        }
        else {
            return utils_2.loadJson(realPath).then(function (data) {
                return Promise.all(utils_1.withPromise(values)).then(function (last) {
                    var cur = handle(data, last);
                    return cur;
                });
            });
        }
    },
};
//# sourceMappingURL=cascader.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var such_1 = require("./such");
var builtRule = /such:([a-zA-Z]+)/;
var loadConf = function (name) {
    if (typeof name === 'string') {
        var isBuilt = builtRule.test(name);
        var file = isBuilt ? "./config/" + RegExp.$1 : name;
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
};
such_1.default.loadConf = loadConf;
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
            continue;
        }
        return filepath;
    }
};
var filename = 'such.config.js';
var lastConfFile = tryConfigFile(path.resolve(__dirname, "../../" + filename), path.join(process.cwd(), filename));
if (lastConfFile) {
    var conf = require(lastConfFile);
    such_1.default.config(conf);
}
exports.default = such_1.default;
//# sourceMappingURL=index.js.map
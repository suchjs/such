"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileCache = void 0;
var utils_1 = require("../helpers/utils");
exports.isFileCache = function (target) {
    return utils_1.isObject(target) && typeof target.mtime === 'number';
};
var store = (function () {
    var fns = {};
    var vars = {};
    var fn = (function (name, value, alwaysVar) {
        if (typeof value !== 'function' || alwaysVar) {
            vars[name] = value;
        }
        else {
            fns[name] = value;
        }
    });
    fn.fns = fns;
    fn.vars = vars;
    fn.mockits = {};
    fn.mockitsCache = {};
    fn.alias = {};
    fn.aliasTypes = [];
    fn.fileCache = {};
    fn.config = {};
    return fn;
})();
exports.default = store;
//# sourceMappingURL=store.js.map
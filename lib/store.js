"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    fn.alias = {};
    fn.aliasTypes = [];
    fn.fileCache = {};
    fn.config = {};
    return fn;
})();
exports.default = store;
//# sourceMappingURL=store.js.map
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var namespace_1 = require("./namespace");
var ToRef = (function (_super) {
    __extends(ToRef, _super);
    function ToRef(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToRef.prototype.init = function () {
        this.addRule('Path', function (Path) {
            if (!Path) {
                throw new Error("the ref type must has a path param.");
            }
        });
    };
    ToRef.prototype.generate = function (options) {
        var datas = options.datas, dpath = options.dpath;
        var Path = this.params.Path;
        var result = [];
        var isExists = true;
        Path.map(function (item) {
            var lastPath;
            if (!item.relative) {
                lastPath = item.path;
            }
            else {
                if (dpath.length < item.depth + 1) {
                    isExists = false;
                }
                else {
                    lastPath = dpath.slice(0, -(1 + item.depth)).concat(item.path);
                }
            }
            if (isExists && datas.has(lastPath)) {
                result.push(datas.get(lastPath));
            }
            else {
                throw new Error("the path of \"" + (lastPath ? '/' + lastPath.join('/') : item.fullpath) + "\" is not exists in the datas.");
            }
        });
        return Path.length === 1 ? result[0] : result;
    };
    ToRef.prototype.test = function () {
        return true;
    };
    return ToRef;
}(namespace_1.default));
exports.default = ToRef;
//# sourceMappingURL=ref.js.map
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var namespace_1 = require("./namespace");
var ToId = (function (_super) {
    __extends(ToId, _super);
    function ToId(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToId.prototype.init = function () {
        this.addRule('Config', function (Config) {
            if (!Config) {
                return;
            }
            var allowKeys = ['start', 'step'];
            var last = {};
            var hasDisallow = Object.keys(Config).some(function (key) {
                var flag = allowKeys.indexOf(key) < 0;
                last[key] = Config[key];
                if (typeof last[key] !== 'number') {
                    throw new Error("the config of key \"" + key + "\" must be a number.got " + last[key]);
                }
                return flag;
            });
            if (hasDisallow) {
                throw new Error("the config of id can only support keys:" + allowKeys.join(','));
            }
        });
    };
    ToId.prototype.generate = function (options) {
        var dpath = options.dpath;
        var config = this.params.Config || {};
        var start = config.hasOwnProperty('start') ? config.start : 1;
        var step = config.hasOwnProperty('step') ? config.step : 1;
        var len = dpath.length;
        while (len--) {
            var cur = dpath[len];
            if (typeof cur === 'number') {
                return start + step * cur;
            }
        }
        return start;
    };
    ToId.prototype.test = function () {
        return true;
    };
    return ToId;
}(namespace_1.default));
exports.default = ToId;
//# sourceMappingURL=id.js.map
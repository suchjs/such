"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var mockit_1 = require("../core/mockit");
var ToId = (function (_super) {
    __extends(ToId, _super);
    function ToId(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToId.prototype.init = function () {
        this.configOptions = {
            step: {
                type: Number,
                default: 1,
            },
            start: {
                type: Number,
                default: 1,
            },
        };
    };
    ToId.prototype.generate = function (options) {
        var dpath = options.dpath;
        var config = (this.params.Config || {});
        var start = config.start, step = config.step;
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
}(mockit_1.default));
exports.default = ToId;
//# sourceMappingURL=id.js.map
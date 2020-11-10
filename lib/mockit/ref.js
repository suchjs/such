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
var utils_1 = require("../helpers/utils");
var mockit_1 = require("../core/mockit");
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
        var mocker = options.mocker;
        var Path = this.params.Path;
        var result = [];
        Path.map(function (item) {
            var refMocker = utils_1.getRefMocker(item, mocker);
            result.push(refMocker.result);
        });
        return Path.length === 1 ? result[0] : utils_1.withPromise(result);
    };
    ToRef.prototype.test = function () {
        return true;
    };
    return ToRef;
}(mockit_1.default));
exports.default = ToRef;
//# sourceMappingURL=ref.js.map
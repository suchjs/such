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
var nprintf_1 = require("nprintf");
var utils_1 = require("../helpers/utils");
var namespace_1 = require("./namespace");
var factor = function (type) {
    var epsilon = Number.EPSILON || Math.pow(2, -52);
    switch (type) {
        case 2:
            return 1 - Math.random();
        case 3:
            return (1 + epsilon) * Math.random();
        case 0:
            return (1 - epsilon) * (1 - Math.random());
        case 1:
        default:
            return Math.random();
    }
};
var ToNumber = (function (_super) {
    __extends(ToNumber, _super);
    function ToNumber(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToNumber.prototype.init = function () {
        this.addRule('Count', function (Count) {
            if (!Count) {
                return;
            }
            var range = Count.range;
            var size = range.length;
            if (size !== 2) {
                throw new Error(size < 2 ? "the count param must have the min and the max params" : "the count param length should be 2,but got " + size);
            }
            var min = range[0], max = range[1];
            min = min.trim();
            max = max.trim();
            if (min === '' && max === '') {
                throw new Error("the min param and max param can not both undefined");
            }
            if (min === '') {
                min = Number.MIN_SAFE_INTEGER || Number.MIN_VALUE;
            }
            if (max === '') {
                max = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
            }
            if (isNaN(min)) {
                throw new Error("the min param expect a number,but got " + min);
            }
            if (isNaN(max)) {
                throw new Error("the max param expect a number,but got " + max);
            }
            var lastMin = Number(min);
            var lastMax = Number(max);
            if (lastMin > lastMax) {
                throw new Error("the min number " + min + " is big than the max number " + max);
            }
            return {
                range: [lastMin, lastMax],
            };
        });
        this.addRule('Format', function (Format) {
            if (!Format) {
                return;
            }
            var format = Format.format;
            if (!nprintf_1.rule.test(format)) {
                throw new Error("Wrong format rule(" + format + ")");
            }
        });
        this.addRule('Config', function (Config) {
            if (!Config) {
                return;
            }
            var allowKeys = ['step'];
            var curKeys = Object.keys(Config);
            for (var i = 0, j = curKeys.length; i < j; i++) {
                var key = curKeys[i];
                if (allowKeys.indexOf(key) < 0) {
                    throw new Error("unexpected config key:" + key + ",the number type can only set keys like \"" + allowKeys.join() + "\".");
                }
                if (key === 'step') {
                    if (isNaN(Config[key])) {
                        throw new Error("the config of step is not a number,got " + Config[key] + ".");
                    }
                    else if (+Config[key] <= 0) {
                        throw new Error("the config of step can not be set to 0 or less than 0.");
                    }
                }
            }
        });
        this.addModifier('Format', (function (result, Format) {
            return nprintf_1.default(Format.format, result);
        }));
    };
    ToNumber.prototype.generate = function () {
        var _a = this.params, Count = _a.Count, Config = _a.Config;
        var result;
        if (Count) {
            var range = Count.range;
            var step = Config && Config.step;
            var min = range[0], max = range[1];
            if (step) {
                var minPlus = 0;
                var maxPlus = Math.floor((max - min) / step);
                if (maxPlus > minPlus) {
                    return +min + step * (minPlus + Math.floor(Math.random() * (maxPlus - minPlus)));
                }
            }
            result = +min + (max - min) * factor(3);
        }
        else {
            result = Math.random() * Math.pow(10, Math.floor(10 * Math.random()));
            result = utils_1.isOptional() ? -result : result;
        }
        return result;
    };
    ToNumber.prototype.test = function () {
        return true;
    };
    return ToNumber;
}(namespace_1.default));
exports.default = ToNumber;
//# sourceMappingURL=number.js.map
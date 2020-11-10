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
var uniRule = /^\\u((?:[0-9a-fA-F]{4}|[0-9a-fA-F]{6}))$/;
var numRule = /^\d+$/;
var hex2num = function (hex) {
    return Number('0x' + hex);
};
var ToString = (function (_super) {
    __extends(ToString, _super);
    function ToString(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToString.prototype.init = function () {
        this.addRule('Size', function (Size) {
            if (!Size) {
                return;
            }
            var range = Size.range;
            if (range.length < 2) {
                throw new Error("The count param should have 2 params,but got " + range.length);
            }
            var _a = range, first = _a[0], second = _a[1];
            var isFirstUni = uniRule.test(first);
            var result = [];
            var maxCodeNum = 0x10ffff;
            if (isFirstUni || numRule.test(first)) {
                var firstNum = void 0;
                var secondNum = void 0;
                if (range.length > 2) {
                    throw new Error("the count of range should have just 2 params,if you want support some specail point code,you can set the param like this,[" + first + "-" + first + ",...]");
                }
                else {
                    if (isFirstUni) {
                        firstNum = hex2num(RegExp.$1);
                        if (!uniRule.test(second)) {
                            throw new Error("the max param \"" + second + "\" should use unicode too.");
                        }
                        else {
                            secondNum = hex2num(RegExp.$1);
                        }
                    }
                    else {
                        firstNum = Number(first);
                        if (!numRule.test(second)) {
                            throw new Error("the max param \"" + second + "\" is not a number.");
                        }
                        else {
                            secondNum = Number(second);
                        }
                    }
                }
                if (secondNum < firstNum) {
                    throw new Error("the min param '" + first + "' is big than the max param '" + second + "'");
                }
                else {
                    if (secondNum > maxCodeNum) {
                        throw new Error("the max param's unicode point is big than the max point (" + second + " > '0x10ffff')");
                    }
                    else {
                        result.push([firstNum, secondNum]);
                    }
                }
            }
            else {
                var uniRangeRule_1 = /^\\u([0-9a-fA-F]{4}|[0-9a-fA-F]{6})\-\\u([0-9a-fA-F]{4}|[0-9A-Fa-f]{6})$/;
                var numRangeRule_1 = /^(\d+)\-(\d+)$/;
                range.map(function (code, index) {
                    var match = null;
                    var firstNum;
                    var secondNum;
                    var isRange = true;
                    if ((match = code.match(uniRangeRule_1))) {
                        firstNum = hex2num(match[1]);
                        secondNum = hex2num(match[2]);
                    }
                    else if ((match = code.match(numRangeRule_1))) {
                        firstNum = Number(match[1]);
                        secondNum = Number(match[2]);
                    }
                    else if (index > 0 && (match = code.match(numRule))) {
                        isRange = false;
                        firstNum = secondNum = Number(match[0]);
                    }
                    else {
                        throw new Error("the param of index " + index + "(" + code + ") is a wrong range or number.");
                    }
                    if (isRange && secondNum < firstNum) {
                        throw new Error("the param of index " + index + "'s range is wrong.(" + match[1] + " > " + match[2] + ")");
                    }
                    if (secondNum > maxCodeNum) {
                        throw new Error("the param of index " + index + "'s code point(" + secondNum + ") is big than 0x10ffff");
                    }
                    else {
                        result.push([firstNum, secondNum]);
                    }
                });
            }
            return {
                range: result,
            };
        });
    };
    ToString.prototype.generate = function () {
        var params = this.params;
        var Length = params.Length;
        var _a = Length || { least: 1, most: 100 }, least = _a.least, most = _a.most;
        var range = (params.Size || {
            range: [[32, 126]],
        }).range;
        var index = range.length - 1;
        var total = utils_1.makeRandom(Number(least), Number(most));
        var result = '';
        for (var i = 1; i <= total; i++) {
            var idx = utils_1.makeRandom(0, index);
            var _b = range[idx], min = _b[0], max = _b[1];
            var point = utils_1.makeRandom(min, max);
            result += String.fromCodePoint(point);
        }
        return result;
    };
    ToString.prototype.test = function () {
        return true;
    };
    return ToString;
}(mockit_1.default));
exports.default = ToString;
//# sourceMappingURL=string.js.map
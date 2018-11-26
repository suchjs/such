"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var PathMap = (function () {
    function PathMap(isPlain) {
        this.isPlain = isPlain;
        this.result = null;
        this.initial = false;
    }
    PathMap.prototype.set = function (keys, value) {
        var valueType = utils_1.typeOf(value);
        var len = keys.length;
        if (this.isPlain && (valueType === 'Array' || valueType === 'Object')) {
            return;
        }
        if (!this.initial) {
            this.result = typeof keys[0] === 'number' ? [] : {};
            this.initial = true;
        }
        var data = this.result;
        var i = 0;
        for (; i < len - 1; i++) {
            var key = keys[i];
            var next = keys[i + 1];
            if (!data[key]) {
                data[key] = typeof next === 'number' ? [] : {};
            }
            data = data[key];
        }
        data[keys[i]] = value;
        return this;
    };
    PathMap.prototype.get = function (keys) {
        var result = this.result;
        try {
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                result = result[key];
            }
        }
        catch (e) {
        }
        return result;
    };
    PathMap.prototype.clear = function () {
        this.result = null;
        this.initial = false;
    };
    PathMap.prototype.has = function (keys) {
        var result = this.result;
        var flag = true;
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (typeof key === 'number') {
                flag = utils_1.typeOf(result) === 'Array' && result.length > key;
            }
            else {
                flag = utils_1.typeOf(result) === 'Object' && result.hasOwnProperty(key);
            }
            if (!flag) {
                break;
            }
            result = result[key];
        }
        return flag;
    };
    return PathMap;
}());
exports.default = PathMap;
//# sourceMappingURL=pathmap.js.map
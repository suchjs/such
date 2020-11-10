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
            if (Array.isArray(data) && typeof key === 'number' && key % 1 === 0) {
                if (data.length < key + 1) {
                    data[key] = typeof next === 'number' ? [] : {};
                }
                data = data[key];
            }
            else if (utils_1.isObject(data)) {
                if (!data.hasOwnProperty(key)) {
                    data[key] = typeof next === 'number' ? [] : {};
                }
                data = data[key];
            }
            else {
                throw new Error("wrong field path key: '" + key + "'");
            }
        }
        data[keys[i]] = value;
        return this;
    };
    PathMap.prototype.get = function (keys) {
        var result = this.result;
        try {
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                result = (typeof key === 'number'
                    ? result[key]
                    : result[key]);
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
                flag = Array.isArray(result) && result.length > key;
                result = result[key];
            }
            else {
                flag = utils_1.isObject(result) && result.hasOwnProperty(key);
                result = result[key];
            }
            if (!flag) {
                break;
            }
        }
        return flag;
    };
    return PathMap;
}());
exports.default = PathMap;
//# sourceMappingURL=pathmap.js.map
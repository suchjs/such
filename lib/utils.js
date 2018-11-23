"use strict";
exports.__esModule = true;
exports.typeOf = function (target) {
    return Object.prototype.toString.call(target).slice(8, -1);
};
exports.map = function (target, fn) {
    if (exports.typeOf(target) === 'Array') {
        return target.map(fn);
    }
    else if (exports.typeOf(target) === 'Object') {
        var ret = {};
        target = target;
        for (var key in target) {
            ret[key] = fn(target[key], key);
        }
        return ret;
    }
    else if (exports.typeOf(target) === 'String') {
        target = target;
        for (var i = 0, j = target.length; i < j; i++) {
            var code = target.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDBFF) {
                var nextCode = target.charCodeAt(i + 1);
                if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
                    fn(target.substr(i, 2), i);
                    i++;
                }
                else {
                    throw new Error('错误的字符编码');
                }
            }
            else {
                fn(target.charAt(i), i);
            }
        }
    }
};
exports.deepLoop = function (obj, fn, curPath) {
    if (curPath === void 0) { curPath = []; }
    var type = exports.typeOf(obj);
    if (type === 'Object') {
        for (var key in obj) {
            var value = obj[key];
            var valType = exports.typeOf(value);
            fn.call(null, key, value, obj, curPath.concat(key).join('.'));
            if (['Object', 'Array'].indexOf(valType) > -1) {
                exports.deepLoop(obj[key], fn, curPath.concat(key));
            }
        }
    }
    else if (type === 'Array') {
        for (var key = 0, len = obj.length; key < len; key++) {
            var value = obj[key];
            var valType = exports.typeOf(value);
            fn.call(null, key, value, obj, curPath.concat('' + key).join('.'));
            if (['Object', 'Array'].indexOf(valType) > -1) {
                exports.deepLoop(obj[key], fn, curPath.concat('' + key));
            }
        }
    }
    return;
};
exports.makeRandom = function (min, max) {
    if (min === max) {
        return min;
    }
    else {
        return min + Math.floor(Math.random() * (max + 1 - min));
    }
};
exports.isOptional = function () {
    return Math.round(Math.random()) === 0;
};
//# sourceMappingURL=utils.js.map
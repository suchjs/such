"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeRegexpChars = function (chars) {
    return chars.replace(/([()[{^$.*+?-])/g, '\\$1');
};
exports.typeOf = function (target) {
    return Object.prototype.toString.call(target).slice(8, -1);
};
exports.isFn = function (target) { return typeof target === 'function'; };
exports.map = function (target, fn) {
    if (exports.typeOf(target) === 'Array') {
        return target.map(fn);
    }
    else if (exports.typeOf(target) === 'Object') {
        var ret = {};
        target = target;
        for (var key in target) {
            if (target.hasOwnProperty(key)) {
                ret[key] = fn(target[key], key);
            }
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
                    throw new Error('wrong code point');
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
            if (obj.hasOwnProperty(key)) {
                var value = obj[key];
                var valType = exports.typeOf(value);
                fn.call(null, key, value, obj, curPath.concat(key).join('.'));
                if (['Object', 'Array'].indexOf(valType) > -1) {
                    exports.deepLoop(obj[key], fn, curPath.concat(key));
                }
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
exports.makeStrRangeList = function (first, last) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (!first || !last) {
        return [];
    }
    var min = first.charCodeAt(0);
    var max = last.charCodeAt(0);
    var results = [];
    var i = 0;
    while (min + i <= max) {
        results.push(String.fromCharCode(min + i));
        i++;
    }
    return args.length > 0 && args.length % 2 === 0 ? results.concat(exports.makeStrRangeList.apply(void 0, args)) : results;
};
exports.isOptional = function () {
    return Math.random() >= 0.5;
};
exports.capitalize = function (target) {
    return target && target.length ? target.charAt(0).toUpperCase() + target.slice(1) : '';
};
exports.decodeTrans = function (target) {
    return target.replace(/\\(.)/g, function (_, res) { return res; });
};
exports.getExp = function (exp) {
    var fn = new Function('', "return " + exp);
    try {
        return fn();
    }
    catch (e) {
        throw new Error("wrong expression of \"" + exp + "\".reason:" + e);
    }
};
exports.getExpValue = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var param = '__$__';
    var value = args.pop();
    var cur;
    while ((cur = args.shift()) !== undefined) {
        try {
            return (new Function(param, "return " + param + "." + value))(cur);
        }
        catch (e) {
        }
    }
};
exports.range = function (start, end, step) {
    if (step === void 0) { step = 1; }
    return Array.apply(null, new Array(end - start + 1)).map(function (_, index) {
        return start + index * step;
    });
};
exports.deepCopy = function (target) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var type = exports.typeOf(target);
    if (type === 'Object' || type === 'Array') {
        var _loop_1 = function (i, j) {
            var copy = args[i];
            if (exports.typeOf(copy) !== type) {
                return "continue";
            }
            var keys = type === 'Object' ? Object.keys(copy) : exports.range(0, copy.length - 1);
            keys.map(function (key) {
                var from = copy[key];
                var to = target[key];
                var fromType = exports.typeOf(from);
                var toType = exports.typeOf(to);
                if (fromType === 'Object' || fromType === 'Array') {
                    target[key] = toType === fromType ? target[key] : (fromType === 'Object' ? {} : []);
                    exports.deepCopy(target[key], from);
                }
                else {
                    target[key] = from;
                }
            });
        };
        for (var i = 0, j = args.length; i < j; i++) {
            _loop_1(i, j);
        }
    }
    return target;
};
exports.isNoEmptyObject = function (target) {
    return exports.typeOf(target) === 'Object' && Object.keys(target).length > 0;
};
exports.isPromise = function (target) {
    return exports.typeOf(target) === 'Promise' || (target && exports.isFn(target.then));
};
exports.shiftObject = function (obj, keys) {
    var res = {};
    keys.map(function (key) {
        res[key] = obj[key];
        delete obj[key];
    });
    return res;
};
exports.withPromise = function (res) {
    var last = [];
    var hasPromise = false;
    res.map(function (item) {
        var imPromise = exports.isPromise(item);
        if (hasPromise) {
            if (imPromise) {
                last.push(item);
            }
            else {
                last.push(Promise.resolve(item));
            }
        }
        else {
            if (imPromise) {
                hasPromise = true;
                last = last.map(function (cur) { return Promise.resolve(cur); });
                last.push(item);
            }
            else {
                last.push(item);
            }
        }
    });
    return last;
};
//# sourceMappingURL=utils.js.map
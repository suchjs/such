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
var config_1 = require("./config");
var pathmap_1 = require("./helpers/pathmap");
var utils = require("./helpers/utils");
var mockitList = require("./mockit");
var namespace_1 = require("./mockit/namespace");
var parser_1 = require("./parser");
var store_1 = require("./store");
var capitalize = utils.capitalize, isFn = utils.isFn, isOptional = utils.isOptional, makeRandom = utils.makeRandom, map = utils.map, typeOf = utils.typeOf;
var AllMockits = {};
map(mockitList, function (item, key) {
    if (key.indexOf('_') === 0) {
        return;
    }
    AllMockits[key] = item;
});
var Mocker = (function () {
    function Mocker(options, rootInstances, rootDatas) {
        var _this = this;
        this.config = {};
        var target = options.target, path = options.path, config = options.config, parent = options.parent;
        this.target = target;
        this.path = path;
        this.config = config || {};
        this.isRoot = path.length === 0;
        if (this.isRoot) {
            this.instances = rootInstances;
            this.datas = rootDatas;
            this.root = this;
            this.parent = this;
        }
        else {
            this.parent = parent;
            this.root = parent.root;
        }
        var dataType = typeOf(this.target).toLowerCase();
        var _a = this.config, min = _a.min, max = _a.max, oneOf = _a.oneOf, alwaysArray = _a.alwaysArray;
        var _b = this.root, instances = _b.instances, datas = _b.datas;
        var hasLength = !isNaN(min);
        this.dataType = dataType;
        if (dataType === 'array') {
            var totalIndex_1 = target.length - 1;
            var getInstance_1 = function (mIndex) {
                mIndex = typeof mIndex === 'number' ? mIndex : makeRandom(0, totalIndex_1);
                var nowPath = path.concat(mIndex);
                var instance = instances.get(nowPath);
                if (!(instance instanceof Mocker)) {
                    instance = new Mocker({
                        target: target[mIndex],
                        path: nowPath,
                        parent: _this,
                    });
                    instances.set(nowPath, instance);
                }
                return instance;
            };
            if (!hasLength) {
                var mockers_1 = target.map(function (_, index) {
                    return getInstance_1(index);
                });
                this.mockFn = function (dpath) {
                    var result = [];
                    mockers_1.map(function (instance, index) {
                        var curDpath = dpath.concat(index);
                        var value = instance.mock(curDpath);
                        result[index] = value;
                        datas.set(curDpath, value);
                    });
                    return result;
                };
            }
            else {
                var makeArrFn_1 = function (dpath, instance, total) {
                    var result = [];
                    var makeInstance = instance instanceof Mocker ? function (i) { return instance; } : function (i) { return instance[i]; };
                    total = typeof total === 'number' ? total : makeRandom(min, max);
                    for (var i = 0; i < total; i++) {
                        var cur = makeInstance(i);
                        var curDpath = dpath.concat(i);
                        var value = cur.mock(curDpath);
                        result[i] = value;
                        datas.set(curDpath, value);
                    }
                    return result;
                };
                var makeOptional_1 = function (dpath, instance, total) {
                    var result;
                    if (total > 1) {
                        throw new Error("optional func of the total param can not more than 1");
                    }
                    else if (total === 1) {
                        result = instance.mock(dpath);
                    }
                    datas.set(dpath, result);
                    return result;
                };
                var resultFn_1;
                if (oneOf) {
                    if (alwaysArray) {
                        resultFn_1 = makeArrFn_1;
                    }
                    else {
                        resultFn_1 = function (dpath, instance) {
                            var total = makeRandom(min, max);
                            if (total <= 1) {
                                return makeOptional_1(dpath, instance, total);
                            }
                            return makeArrFn_1(dpath, instance, total);
                        };
                    }
                    this.mockFn = function (dpath) {
                        var instance = getInstance_1();
                        return resultFn_1(dpath, instance);
                    };
                }
                else {
                    var makeRandArrFn_1 = function (dpath, total) {
                        total = !isNaN(total) ? total : makeRandom(min, max);
                        var targets = Array.apply(null, new Array(total)).map(function () {
                            return getInstance_1();
                        });
                        return makeArrFn_1(dpath, targets, total);
                    };
                    if (alwaysArray || min > 1) {
                        this.mockFn = function (dpath) {
                            return makeRandArrFn_1(dpath);
                        };
                    }
                    else {
                        this.mockFn = function (dpath) {
                            var total = makeRandom(min, max);
                            if (total <= 1) {
                                return makeOptional_1(dpath, getInstance_1(), total);
                            }
                            return makeRandArrFn_1(dpath, total);
                        };
                    }
                }
            }
        }
        else if (dataType === 'object') {
            var keys_1 = Object.keys(target).map(function (i) {
                var val = target[i];
                var _a = Mocker.parseKey(i), key = _a.key, conf = _a.config;
                return {
                    key: key,
                    target: val,
                    config: conf,
                };
            });
            this.mockFn = function (dpath) {
                var result = {};
                var prevPath = _this.path;
                keys_1.map(function (item) {
                    var key = item.key, conf = item.config, tar = item.target;
                    var optional = conf.optional;
                    var nowPath = prevPath.concat(key);
                    var nowDpath = dpath.concat(key);
                    if (optional && isOptional()) {
                    }
                    else {
                        var instance = instances.get(nowPath);
                        if (!(instance instanceof Mocker)) {
                            instance = new Mocker({
                                target: tar,
                                config: conf,
                                path: nowPath,
                                parent: _this,
                            });
                            instances.set(nowPath, instance);
                        }
                        var value = instance.mock(nowDpath);
                        result[key] = value;
                        datas.set(nowDpath, value);
                    }
                });
                return result;
            };
        }
        else {
            var match = void 0;
            if (dataType === 'string' && (match = target.match(config_1.suchRule)) && AllMockits.hasOwnProperty(match[1])) {
                this.type = match[1];
                var klass = AllMockits[match[1]];
                var instance_1 = new klass();
                var meta = target.replace(match[0], '').replace(/^\s*:\s*/, '');
                if (meta !== '') {
                    var params = parser_1.default.parse(meta);
                    instance_1.setParams(params);
                }
                this.mockit = instance_1;
                this.mockFn = function (dpath) { return instance_1.make(datas, dpath); };
            }
            else {
                this.mockFn = function (dpath) { return target; };
            }
        }
    }
    Mocker.parseKey = function (key) {
        var rule = /(\??)(:?)(?:\{(\d+)(?:,(\d+))?}|\[(\d+)(?:,(\d+))?])?$/;
        var match;
        var config = {};
        if ((match = key.match(rule)).length && match[0] !== '') {
            var all = match[0], query = match[1], colon = match[2], lMin = match[3], lMax = match[4], aMin = match[5], aMax = match[6];
            var hasArrLen = aMin !== undefined;
            var hasNormalLen = lMin !== undefined;
            config.optional = query === '?';
            config.oneOf = colon === ':';
            config.alwaysArray = hasArrLen;
            if (hasNormalLen || hasArrLen) {
                var min = hasNormalLen ? lMin : aMin;
                var max = hasNormalLen ? lMax : aMax;
                if (max === undefined) {
                    max = min;
                }
                if (Number(max) < Number(min)) {
                    throw new Error("the max of " + max + " is less than " + min);
                }
                config.min = Number(min);
                config.max = Number(max);
            }
            else if (config.oneOf) {
                config.min = config.max = 1;
            }
            key = key.slice(0, -all.length);
        }
        return {
            key: key,
            config: config,
        };
    };
    Mocker.prototype.setParams = function (value) {
        if (this.mockit) {
            return this.mockit.setParams(typeof value === 'string' ? parser_1.default.parse(value) : value);
        }
        else {
            throw new Error('This mocker is not the mockit type.');
        }
    };
    Mocker.prototype.mock = function (dpath) {
        var optional = this.config.optional;
        if (this.isRoot && optional && isOptional()) {
            return;
        }
        return this.mockFn(dpath);
    };
    return Mocker;
}());
exports.Mocker = Mocker;
var Such = (function () {
    function Such(target, options) {
        this.initail = false;
        this.target = target;
        this.instances = new pathmap_1.default(false);
        this.datas = new pathmap_1.default(true);
        this.mocker = new Mocker({
            target: target,
            path: [],
            config: options && options.config,
        }, this.instances, this.datas);
    }
    Such.as = function (target, options) {
        var ret = new Such(target, options);
        return options && options.instance ? ret : ret.a();
    };
    Such.assign = function (name, value, alwaysVar) {
        if (alwaysVar === void 0) { alwaysVar = false; }
        store_1.default(name, value, alwaysVar);
    };
    Such.define = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var argsNum = args.length;
        if (argsNum === 0 || argsNum > 2) {
            throw new Error("the static \"define\" method's arguments is not right.");
        }
        var opts = args.pop();
        var config = argsNum === 2 && typeof opts === 'string' ? { param: opts } : (argsNum === 1 && typeof opts === 'function' ? { generate: opts } : opts);
        var param = config.param, init = config.init, generateFn = config.generateFn, generate = config.generate, ignoreRules = config.ignoreRules;
        var params = typeof param === 'string' ? parser_1.default.parse(param) : {};
        var constrName = "To" + capitalize(type);
        if (!AllMockits.hasOwnProperty(type)) {
            var klass = void 0;
            if (argsNum === 2) {
                var baseType = args[0];
                var base = AllMockits[baseType];
                if (!base) {
                    throw new Error("the defined type \"" + type + "\" what based on type of \"" + baseType + "\" is not exists.");
                }
                klass = (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        var _this = _super.call(this, constrName) || this;
                        _this.ignoreRules = ignoreRules || [];
                        _this.setParams(params);
                        return _this;
                    }
                    class_1.prototype.init = function () {
                        _super.prototype.init.call(this);
                        if (isFn(init)) {
                            init.call(this);
                        }
                        if (isFn(generateFn)) {
                            this.reGenerate(generateFn);
                        }
                    };
                    return class_1;
                }(base));
            }
            else {
                klass = (function (_super) {
                    __extends(class_2, _super);
                    function class_2() {
                        var _this = _super.call(this, constrName) || this;
                        _this.ignoreRules = ignoreRules || [];
                        _this.setParams(params, undefined);
                        return _this;
                    }
                    class_2.prototype.init = function () {
                        if (isFn(init)) {
                            init.call(this);
                        }
                    };
                    class_2.prototype.generate = function (datas, dpath) {
                        return generate.call(this, datas, dpath);
                    };
                    class_2.prototype.test = function () {
                        return true;
                    };
                    return class_2;
                }(namespace_1.default));
            }
            AllMockits[type] = klass;
        }
        else {
            throw new Error("the type \"" + type + "\" has been defined yet.");
        }
    };
    Such.prototype.a = function () {
        if (!this.initail) {
            this.initail = true;
        }
        else {
            this.datas.clear();
        }
        return this.mocker.mock([]);
    };
    Such.utils = utils;
    return Such;
}());
exports.default = Such;
//# sourceMappingURL=such.js.map
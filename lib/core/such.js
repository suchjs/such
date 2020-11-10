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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mocker = void 0;
var config_1 = require("../data/config");
var pathmap_1 = require("../helpers/pathmap");
var utils = require("../helpers/utils");
var mockit_1 = require("../data/mockit");
var mockit_2 = require("./mockit");
var parser_1 = require("../data/parser");
var store_1 = require("../data/store");
var capitalize = utils.capitalize, isFn = utils.isFn, isOptional = utils.isOptional, makeRandom = utils.makeRandom, typeOf = utils.typeOf, deepCopy = utils.deepCopy, isNoEmptyObject = utils.isNoEmptyObject;
var alias = store_1.default.alias, aliasTypes = store_1.default.aliasTypes;
var ALL_MOCKITS = {};
Object.keys(mockit_1.mockitList).map(function (key) {
    if (key.startsWith('_')) {
        return;
    }
    ALL_MOCKITS[key] = mockit_1.mockitList[key];
});
var Mocker = (function () {
    function Mocker(options, rootInstances, rootDatas) {
        var _this = this;
        this.config = {};
        this.promises = [];
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
        var dataType = typeOf(target).toLowerCase();
        var _a = this.config, min = _a.min, max = _a.max, oneOf = _a.oneOf, alwaysArray = _a.alwaysArray;
        var _b = this.root, instances = _b.instances, datas = _b.datas;
        var hasLength = !isNaN(min);
        this.dataType = dataType;
        if (Array.isArray(target)) {
            var totalIndex_1 = target.length - 1;
            var getInstance_1 = function (mIndex) {
                mIndex =
                    typeof mIndex === 'number' ? mIndex : makeRandom(0, totalIndex_1);
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
                    var makeInstance = instance instanceof Mocker
                        ? function (_i) { return instance; }
                        : function (i) { return instance[i]; };
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
                        total = !isNaN(total) ? Number(total) : makeRandom(min, max);
                        var targets = Array.from({
                            length: total,
                        }).map(function () {
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
            var oTarget_1 = target;
            var keys_1 = Object.keys(oTarget_1).map(function (i) {
                var val = oTarget_1[i];
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
            if (dataType === 'string') {
                var sTarget = target;
                var match = sTarget.match(config_1.suchRule);
                var type = match && match[1];
                if (type) {
                    var lastType = alias[type] ? alias[type] : type;
                    if (ALL_MOCKITS.hasOwnProperty(lastType)) {
                        this.type = lastType;
                        var klass = ALL_MOCKITS[lastType];
                        var instance_1 = new klass();
                        var meta = sTarget.replace(match[0], '').replace(/^\s*:\s*/, '');
                        if (meta !== '') {
                            var params = parser_1.default.parse(meta);
                            instance_1.setParams(params);
                        }
                        this.mockit = instance_1;
                        this.mockFn = function (dpath) {
                            return instance_1.make({
                                datas: datas,
                                dpath: dpath,
                                such: Such,
                                mocker: _this,
                            });
                        };
                        return;
                    }
                }
            }
            this.mockFn = function (_dpath) { return target; };
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
        var _this = this;
        var optional = this.config.optional;
        if (this.isRoot && optional && isOptional()) {
            return;
        }
        var result = this.mockFn(dpath);
        if (this.isRoot) {
            if (this.promises.length) {
                var queues_1 = [];
                var dpaths_1 = [];
                this.promises.map(function (item) {
                    var promise = item.result, curDPath = item.dpath;
                    queues_1.push(promise);
                    dpaths_1.push(curDPath);
                });
                return (function () { return __awaiter(_this, void 0, void 0, function () {
                    var results;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4, Promise.all(queues_1)];
                            case 1:
                                results = _a.sent();
                                results.map(function (res, i) {
                                    _this.datas.set(dpaths_1[i], res);
                                });
                                return [2, (this.result = this.datas.get([]))];
                        }
                    });
                }); })();
            }
        }
        else {
            if (utils.isPromise(result)) {
                this.root.promises.push({
                    dpath: dpath,
                    result: result,
                });
            }
        }
        return (this.result = result);
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
    Such.alias = function (short, long) {
        if (short === '' || long === '' || short === long) {
            throw new Error("wrong alias params:[" + short + "][" + long + "]");
        }
        if (aliasTypes.indexOf(long) > -1) {
            throw new Error("the type of \"" + long + "\" has an alias yet,can not use \"" + short + "\" for alias name.");
        }
        else {
            alias[short] = long;
            aliasTypes.push(long);
        }
    };
    Such.config = function (config) {
        var parsers = config.parsers, types = config.types, globals = config.globals;
        var fnHashs = {
            parsers: 'parser',
            types: 'define',
            globals: 'assign',
        };
        var lastConf = {};
        var such = Such;
        if (config.extends && typeof such.loadConf === 'function') {
            var confFiles = typeof config.extends === 'string' ? [config.extends] : config.extends;
            var confs = such.loadConf(confFiles);
            confs.map(function (conf) {
                delete conf.extends;
                deepCopy(lastConf, conf);
            });
        }
        deepCopy(lastConf, {
            parsers: parsers || {},
            types: types || {},
            globals: globals || {},
        });
        Object.keys(lastConf).map(function (key) {
            var conf = lastConf[key];
            var fnName = fnHashs.hasOwnProperty(key) ? fnHashs[key] : key;
            Object.keys(conf).map(function (name) {
                var fn = such[fnName];
                var args = Array.isArray(conf[name])
                    ? conf[name]
                    : [conf[name]];
                fn.apply(void 0, __spreadArrays([name], args));
            });
        });
    };
    Such.parser = function (name, params) {
        var config = params.config, parse = params.parse, setting = params.setting;
        return parser_1.default.addParser(name, config, parse, setting);
    };
    Such.as = function (target, options) {
        return Such.instance(target, options).a();
    };
    Such.instance = function (target, options) {
        return new Such(target, options);
    };
    Such.assign = function (name, value, alwaysVar) {
        if (alwaysVar === void 0) { alwaysVar = false; }
        store_1.default(name, value, alwaysVar);
    };
    Such.define = function (type) {
        var args = [];
        for (var _a = 1; _a < arguments.length; _a++) {
            args[_a - 1] = arguments[_a];
        }
        var argsNum = args.length;
        if (argsNum === 0 || argsNum > 2) {
            throw new Error("the static \"define\" method's arguments is not right, expect 1 or 2 argments, but got " + argsNum);
        }
        var opts = args.pop();
        var config = argsNum === 2 && typeof opts === 'string'
            ? { param: opts }
            : argsNum === 1 && typeof opts === 'function'
                ? { generate: opts }
                : opts;
        var param = config.param, init = config.init, generateFn = config.generateFn, generate = config.generate, configOptions = config.configOptions;
        var params = typeof param === 'string' ? parser_1.default.parse(param) : {};
        var constrName = "To" + capitalize(type);
        if (!ALL_MOCKITS.hasOwnProperty(type)) {
            var klass = void 0;
            if (argsNum === 2) {
                var baseType = args[0];
                var BaseClass = ALL_MOCKITS[baseType];
                if (!BaseClass) {
                    throw new Error("the defined type \"" + type + "\" what based on type of \"" + baseType + "\" is not exists.");
                }
                klass = (function (_super) {
                    __extends(class_1, _super);
                    function class_1() {
                        return _super.call(this, constrName) || this;
                    }
                    class_1.prototype.init = function () {
                        _super.prototype.init.call(this);
                        if (isNoEmptyObject(configOptions)) {
                            this.configOptions = deepCopy({}, this.configOptions, configOptions);
                        }
                        if (isFn(init)) {
                            init.call(this);
                        }
                        if (isFn(generateFn)) {
                            this.reGenerate(generateFn);
                        }
                        if (isNoEmptyObject(params)) {
                            this.setParams(params);
                        }
                        this.frozen();
                    };
                    return class_1;
                }(BaseClass));
            }
            else {
                klass = (function (_super) {
                    __extends(class_2, _super);
                    function class_2() {
                        return _super.call(this, constrName) || this;
                    }
                    class_2.prototype.init = function () {
                        if (isNoEmptyObject(configOptions)) {
                            this.configOptions = deepCopy({}, this.configOptions, configOptions);
                        }
                        if (isFn(init)) {
                            init.call(this);
                        }
                        if (isNoEmptyObject(params)) {
                            this.setParams(params);
                        }
                        this.frozen();
                    };
                    class_2.prototype.generate = function (options) {
                        return generate.call(this, options);
                    };
                    class_2.prototype.test = function () {
                        return true;
                    };
                    return class_2;
                }(mockit_2.default));
            }
            ALL_MOCKITS[type] = klass;
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
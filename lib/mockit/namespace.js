"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../helpers/utils");
var store_1 = require("../store");
var globalFns = store_1.default.fns, globalVars = store_1.default.vars, mockits = store_1.default.mockits;
var Mockit = (function () {
    function Mockit(constructorName) {
        var _this = this;
        this.constructorName = constructorName;
        this.configOptions = {};
        this.params = {};
        this.origParams = {};
        this.isValidOk = false;
        this.hasValid = false;
        this.invalidKeys = [];
        var constrName = constructorName || this.constructor.name;
        if (mockits[constrName]) {
            var define_1 = mockits[constrName].define;
            if (utils_1.typeOf(define_1) === 'Object') {
                Object.keys(define_1).map(function (key) {
                    var value = define_1[key];
                    if (utils_1.typeOf(value) === 'Object') {
                        _this[key] = utils_1.deepCopy({}, value);
                    }
                    else {
                        _this[key] = value;
                    }
                });
            }
            return;
        }
        mockits[constrName] = {
            rules: [],
            ruleFns: {},
            modifiers: [],
            modifierFns: {},
        };
        this.init();
        this.addRule('Func', function (Func) {
            if (!Func) {
                return;
            }
            var options = Func.options;
            var _loop_1 = function (i, j) {
                var item = options[i];
                var name_1 = item.name, params = item.params;
                params.map(function (param) {
                    if (param.variable) {
                        try {
                            if ((param.value.indexOf('.') > -1 || param.value.indexOf('[') > -1)) {
                                new Function('__CONFIG__', 'return __CONFIG__.' + param.value)(globalVars);
                            }
                            else if (!globalVars.hasOwnProperty(param.value)) {
                                throw new Error("\"" + param.value + " is not assigned.\"");
                            }
                        }
                        catch (e) {
                            throw new Error("the modifier function " + name_1 + "'s param " + param.value + " is not correct:" + e.message);
                        }
                    }
                });
            };
            for (var i = 0, j = options.length; i < j; i++) {
                _loop_1(i, j);
            }
        });
        var configOptions = this.configOptions;
        if (utils_1.isNoEmptyObject(configOptions)) {
            this.addRule('Config', function (Config) {
                var last = utils_1.deepCopy({}, Config || {});
                Object.keys(configOptions).map(function (key) {
                    var cur = configOptions[key];
                    var required = false;
                    var def;
                    var type;
                    var typeNames = [];
                    var validator = function (target) {
                        var targetType = utils_1.typeOf(target);
                        var allTypes = utils_1.typeOf(type) === 'Array' ? type : [type];
                        var flag = false;
                        allTypes.map(function (Cur) {
                            var curName = Cur.name;
                            typeNames.push(curName);
                            if (!flag) {
                                flag = targetType === curName;
                            }
                        });
                        return flag;
                    };
                    var hasKey = last.hasOwnProperty(key);
                    if (utils_1.typeOf(cur) === 'Object') {
                        required = !!cur.required;
                        def = utils_1.isFn(cur.default) ? cur.default() : cur.default;
                        type = cur.type;
                        validator = utils_1.isFn(cur.validator) ? cur.validator : validator;
                    }
                    if (required && !hasKey) {
                        throw new Error(constrName + " required set config \"" + key + "\"");
                    }
                    else if (hasKey && !validator.call(null, last[key])) {
                        throw new Error("the config of \"" + key + "\"'s value " + last[key] + " is not instance of " + typeNames.join(','));
                    }
                    else {
                        if (!hasKey && def !== undefined) {
                            last[key] = def;
                        }
                    }
                });
                return last;
            });
        }
    }
    Mockit.prototype.addModifier = function (name, fn, pos) {
        return this.add('modifier', name, fn, pos);
    };
    Mockit.prototype.addRule = function (name, fn, pos) {
        return this.add('rule', name, fn, pos);
    };
    Mockit.prototype.setParams = function (key, value) {
        var params = {};
        if (typeof key === 'object' && value === undefined) {
            params = key;
        }
        else if (typeof key === 'string') {
            params[key] = value;
        }
        this.resetValidInfo();
        utils_1.deepCopy(this.origParams, params);
        utils_1.deepCopy(this.params, params);
        this.validate();
        return this.origParams;
    };
    Mockit.prototype.frozen = function () {
        var constrName = this.constructorName || this.constructor.name;
        var _a = this, params = _a.params, origParams = _a.origParams, generateFn = _a.generateFn, configOptions = _a.configOptions;
        mockits[constrName].define = utils_1.deepCopy({}, {
            params: params,
            origParams: origParams,
            configOptions: configOptions,
            generateFn: generateFn,
        });
        return this;
    };
    Mockit.prototype.reGenerate = function (fn) {
        this.generateFn = fn;
    };
    Mockit.prototype.make = function (options) {
        this.validate();
        var params = this.params;
        var _a = mockits[this.constructorName || this.constructor.name], modifiers = _a.modifiers, modifierFns = _a.modifierFns;
        var result = typeof this.generateFn === 'function' ? this.generateFn.call(this, options) : this.generate(options);
        var i;
        var j = modifiers.length;
        for (i = 0; i < j; i++) {
            var name_2 = modifiers[i];
            if (params.hasOwnProperty(name_2)) {
                var fn = modifierFns[name_2];
                var args = [result, params[name_2], options];
                result = fn.apply(this, args);
            }
        }
        var _b = this.params, Config = _b.Config, Func = _b.Func;
        if (Func) {
            var queue = Func.queue, fnsParams = Func.params, fns = Func.fns;
            for (i = 0, j = queue.length; i < j; i++) {
                var name_3 = queue[i];
                var fn = fns[i];
                var args = (globalFns[name_3] ? [globalFns[name_3]] : []).concat([fnsParams[i], globalVars, result, Config || {}, utils_1.getExpValue]);
                result = fn.apply(options, args);
            }
        }
        return result;
    };
    Mockit.prototype.add = function (type, name, fn, pos) {
        var curName = this.constructorName || this.constructor.name;
        var _a = mockits[curName], rules = _a.rules, ruleFns = _a.ruleFns, modifiers = _a.modifiers, modifierFns = _a.modifierFns;
        var target;
        var fns;
        if (type === 'rule') {
            target = rules;
            fns = ruleFns;
        }
        else {
            target = modifiers;
            fns = modifierFns;
        }
        if (target.indexOf(name) > -1) {
            throw new Error(type + " of " + name + " already exists");
        }
        else {
            if (typeof pos === 'undefined' || pos.trim() === '') {
                target.push(name);
            }
            else {
                var prepend = false;
                if (pos.charAt(0) === '^') {
                    prepend = true;
                    pos = pos.slice(1);
                }
                if (pos === '') {
                    target.unshift(name);
                }
                else {
                    var findIndex = target.indexOf(pos);
                    if (findIndex < 0) {
                        throw new Error("no exists " + type + " name of " + pos);
                    }
                    else {
                        target.splice(findIndex + (prepend ? 0 : 1), 0, name);
                    }
                }
            }
            fns[name] = fn;
        }
    };
    Mockit.prototype.validParams = function () {
        var _this = this;
        var params = this.origParams;
        var _a = mockits[this.constructorName || this.constructor.name], rules = _a.rules, ruleFns = _a.ruleFns;
        var keys = Object.keys(params);
        rules.map(function (name) {
            try {
                var res = ruleFns[name].call(_this, params[name]);
                if (typeof res === 'object') {
                    _this.params[name] = res;
                }
                var index = keys.indexOf(name);
                if (index > -1) {
                    keys.splice(index, 1);
                }
            }
            catch (e) {
                _this.invalidKeys.push("[(" + name + ")" + e.message + "]");
            }
        });
        if (keys.length) {
            console.warn("the params of keys:" + keys.join(',') + " has no valid rule.");
        }
        return this.invalidKeys.length === 0;
    };
    Mockit.prototype.validate = function () {
        var invalidKeys = this.invalidKeys;
        if (!this.hasValid) {
            this.isValidOk = this.validParams();
            this.hasValid = true;
        }
        if (!this.isValidOk) {
            throw new Error("invalid params:" + invalidKeys.join(','));
        }
    };
    Mockit.prototype.resetValidInfo = function () {
        this.isValidOk = false;
        this.hasValid = false;
        this.invalidKeys = [];
    };
    return Mockit;
}());
exports.default = Mockit;
//# sourceMappingURL=namespace.js.map
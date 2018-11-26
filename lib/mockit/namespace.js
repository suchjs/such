"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = require("../store");
var globalFns = store_1.default.fns, globalVars = store_1.default.vars, mockits = store_1.default.mockits;
var Mockit = (function () {
    function Mockit(constructorName) {
        this.constructorName = constructorName;
        this.userFns = [];
        this.userFnQueue = [];
        this.userFnParams = {};
        this.params = {};
        this.ignoreRules = [];
        this.isValidOk = false;
        this.hasValid = false;
        this.invalidKeys = [];
        var constrName = constructorName || this.constructor.name;
        if (mockits[constrName]) {
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
            var _loop_1 = function (i, j) {
                var item = Func[i];
                var name_1 = item.name, params = item.params;
                params.map(function (param) {
                    if (param.variable) {
                        try {
                            new Function('__CONFIG__', 'return __CONFIG__.' + param.value)(globalVars);
                        }
                        catch (e) {
                            throw new Error("the modifier function " + name_1 + "'s param " + param.value + " is not correct:" + e.message);
                        }
                    }
                });
            };
            for (var i = 0, j = Func.length; i < j; i++) {
                _loop_1(i, j);
            }
        });
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
        this.params = params;
        return params;
    };
    Mockit.prototype.reGenerate = function (fn) {
        this.generateFn = fn;
    };
    Mockit.prototype.make = function (datas, dpath) {
        var _a = this, params = _a.params, userFnQueue = _a.userFnQueue, userFns = _a.userFns, userFnParams = _a.userFnParams, invalidKeys = _a.invalidKeys;
        if (!this.hasValid) {
            this.isValidOk = this.validParams();
        }
        if (!this.isValidOk) {
            throw new Error("invalid params:" + invalidKeys.join(','));
        }
        var _b = mockits[this.constructorName || this.constructor.name], modifiers = _b.modifiers, modifierFns = _b.modifierFns;
        var result = typeof this.generateFn === 'function' ? this.generateFn.call(this, datas, dpath) : this.generate(datas, dpath);
        var i;
        var j = modifiers.length;
        for (i = 0; i < j; i++) {
            var name_2 = modifiers[i];
            if (params.hasOwnProperty(name_2)) {
                var fn = modifierFns[name_2];
                var args = [result, params[name_2], datas, dpath];
                result = fn.apply(this, args);
            }
        }
        var Config = this.params.Config;
        for (i = 0, j = userFnQueue.length; i < j; i++) {
            var name_3 = userFnQueue[i];
            var fn = userFns[name_3];
            var args = (globalFns[name_3] ? [globalFns[name_3]] : []).concat([userFnParams[name_3], globalVars, result, Config || {}]);
            result = fn.apply({
                datas: datas,
                dpath: dpath,
            }, args);
        }
        return result;
    };
    Mockit.prototype.parseFuncParams = function (Func) {
        this.userFnQueue = [];
        var _loop_2 = function (i, j) {
            var _a = Func[i], name_4 = _a.name, params = _a.params;
            var isUserDefined = globalFns.hasOwnProperty(name_4);
            var confName = '__CONFIG__';
            var varName = '__VARS__';
            var argName = '__ARGS__';
            var resName = '__RESULT__';
            var fnName = isUserDefined ? '__FN__' : resName + "." + name_4;
            var useFnParam = isUserDefined ? [fnName] : [];
            var lastParams = isUserDefined ? [resName] : [];
            var paramValues = [];
            var index = 0;
            params.forEach(function (param) {
                var value = param.value, variable = param.variable;
                if (variable) {
                    lastParams.push(confName + ".hasOwnProperty(\"" + value + "\") ? " + confName + "[\"" + value + "\"] : " + varName + "[\"" + value + "\"]");
                }
                else {
                    paramValues.push(value);
                    lastParams.push(argName + "[" + index++ + "]");
                }
            });
            this_1.userFnQueue.push(name_4);
            this_1.userFns[name_4] = new Function(useFnParam.concat(argName, varName, resName, confName).join(','), isUserDefined ? "return " + fnName + ".apply(this,[" + lastParams.join(',') + "]);" : "return " + fnName + "(" + lastParams.join(',') + ")");
            this_1.userFnParams[name_4] = paramValues;
        };
        var this_1 = this;
        for (var i = 0, j = Func.length; i < j; i++) {
            _loop_2(i, j);
        }
    };
    Mockit.prototype.add = function (type, name, fn, pos) {
        if (this.ignoreRules.indexOf(name) > -1) {
            return;
        }
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
        var params = this.params;
        var _a = mockits[this.constructorName || this.constructor.name], rules = _a.rules, ruleFns = _a.ruleFns;
        var keys = Object.keys(params);
        rules.map(function (name) {
            try {
                var res = ruleFns[name].call(_this, params[name]);
                if (name === 'Func' && params[name]) {
                    _this.parseFuncParams(params[name]);
                }
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
    Mockit.prototype.resetValidInfo = function () {
        this.isValidOk = false;
        this.hasValid = false;
        this.invalidKeys = [];
    };
    return Mockit;
}());
exports.default = Mockit;
//# sourceMappingURL=namespace.js.map
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
            for (var i = 0, j = Func.length; i < j; i++) {
                var item = Func[i];
                var name_1 = item.name;
                var fn = globalFns[name_1];
                if (!fn) {
                    throw new Error("the \"Func\" params used undefined function \"" + item.name + "\"");
                }
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
        var _this = this;
        var params = {};
        if (typeof key === 'object' && value === undefined) {
            params = key;
        }
        else if (typeof key === 'string') {
            params[key] = value;
        }
        var _a = mockits[this.constructorName || this.constructor.name], rules = _a.rules, ruleFns = _a.ruleFns;
        var keys = Object.keys(params);
        (keys.length > 1 ? keys.sort(function (a, b) {
            return rules.indexOf(a) < rules.indexOf(b) ? 1 : -1;
        }) : keys).map(function (name) {
            if (rules.indexOf(name) > -1) {
                try {
                    var res = ruleFns[name].call(_this, params[name]);
                    if (name === 'Func') {
                        _this.parseFuncParams(params[name]);
                    }
                    if (typeof res === 'object') {
                        _this.params[name] = res;
                    }
                    else {
                        _this.params[name] = params[name];
                    }
                }
                catch (e) {
                    throw e;
                }
            }
            else {
                throw new Error("Unsupported param (" + name + ")");
            }
        });
        return params;
    };
    Mockit.prototype.reGenerate = function (fn) {
        this.generateFn = fn;
    };
    Mockit.prototype.make = function (Such) {
        var _a = mockits[this.constructorName || this.constructor.name], modifiers = _a.modifiers, modifierFns = _a.modifierFns;
        var _b = this, params = _b.params, userFnQueue = _b.userFnQueue, userFns = _b.userFns, userFnParams = _b.userFnParams;
        var result = typeof this.generateFn === 'function' ? this.generateFn.call(this) : this.generate();
        var i;
        var j = modifiers.length;
        for (i = 0; i < j; i++) {
            var name_2 = modifiers[i];
            if (params.hasOwnProperty(name_2)) {
                var fn = modifierFns[name_2];
                var args = [result, params[name_2]];
                if (fn.length === 3) {
                    args.push(Such);
                }
                result = fn.apply(this, args);
            }
        }
        var Config = this.params.Config;
        for (i = 0, j = userFnQueue.length; i < j; i++) {
            var name_3 = userFnQueue[i];
            var fn = userFns[name_3];
            result = fn.apply(null, [result, Config || {}, globalVars, globalFns[name_3], userFnParams[name_3]]);
        }
        return result;
    };
    Mockit.prototype.parseFuncParams = function (Func) {
        this.userFnQueue = [];
        var _loop_1 = function (i, j) {
            var _a = Func[i], name_4 = _a.name, params = _a.params;
            var confName = '__CONFIG__';
            var varName = '__VARS__';
            var argName = '__ARGS__';
            var fnName = '__FN__';
            var resName = '__RESULT__';
            var lastParams = [resName];
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
            this_1.userFns[name_4] = new Function([resName, confName, varName, fnName, argName].join(','), "return " + fnName + "(" + lastParams.join(',') + ");");
            this_1.userFnParams[name_4] = paramValues;
        };
        var this_1 = this;
        for (var i = 0, j = Func.length; i < j; i++) {
            _loop_1(i, j);
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
    return Mockit;
}());
exports.default = Mockit;
//# sourceMappingURL=namespace.js.map
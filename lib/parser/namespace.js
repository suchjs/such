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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var utils_1 = require("../helpers/utils");
var ParserInterface = (function () {
    function ParserInterface() {
        this.patterns = [];
        this.code = '';
        this.setting = {
            frozen: true,
        };
        this.frozenData = {
            params: [],
            patterns: [],
            code: '',
            tags: {
                start: '',
                end: '',
            },
        };
        this.init();
    }
    ParserInterface.prototype.init = function () {
        var _this = this;
        var frozenData = this.frozenData;
        Object.keys(frozenData).forEach(function (key) {
            _this[key] = frozenData[key];
        });
        return this;
    };
    ParserInterface.prototype.info = function () {
        var _a = this, tags = _a.tags, params = _a.params, code = _a.code, patterns = _a.patterns;
        return {
            tags: tags,
            params: params,
            code: code,
            patterns: patterns,
        };
    };
    ParserInterface.prototype.parseCode = function (code, tags) {
        this.code = code;
        this.tags = tags;
        var start = tags.start, end = tags.end;
        var constr = this.constructor;
        var separator = constr.separator, pattern = constr.pattern;
        if (!separator && !end) {
            this.params = [code];
        }
        else {
            var params = [];
            var sliceInfo = [start.length].concat(end ? -end.length : []);
            var res = code.slice.apply(code, sliceInfo);
            if (!pattern) {
                var seg = '';
                for (var i = 0, j = res.length; i < j; i++) {
                    var cur = res.charAt(i);
                    if (cur === '\\') {
                        seg += '\\' + res.charAt(++i);
                    }
                    else {
                        if (cur === separator) {
                            params.push(seg);
                            seg = '';
                        }
                        else {
                            seg += cur;
                        }
                    }
                }
                if (params.length || seg) {
                    params.push(seg);
                }
            }
            else {
                var match = null;
                var curCode = res;
                var len = 0;
                var total = res.length;
                while (len < total && (match = curCode.match(pattern)) !== null) {
                    var segLen = match[0].length;
                    len += segLen;
                    var sep = res.charAt(len);
                    if (segLen === 0) {
                        throw new Error("the pattern rule \"" + pattern.toString() + "\" match nothing to the string:" + curCode);
                    }
                    else if (len < total && sep !== separator) {
                        throw new Error("unexpected separator character \"" + sep + "\" in \"" + curCode.slice(len) + "\",expect to be \"" + separator + "\"");
                    }
                    else {
                        len += 1;
                        curCode = curCode.slice(segLen + 1);
                        params.push(match[0]);
                        pattern.lastIndex = 0;
                        this.patterns.push(match);
                    }
                }
            }
            this.params = params;
        }
    };
    ParserInterface.prototype.halt = function (err) {
        throw new Error(err);
    };
    return ParserInterface;
}());
exports.ParserInterface = ParserInterface;
var Dispatcher = (function () {
    function Dispatcher() {
        this.parsers = {};
        this.tagPairs = [];
        this.pairHash = {};
        this.splitor = config_1.splitor;
        this.instances = {};
    }
    Dispatcher.prototype.addParser = function (name, config, parse, setting) {
        var startTag = config.startTag, endTag = config.endTag, separator = config.separator, pattern = config.pattern;
        var splitor = this.splitor;
        if (separator === splitor) {
            return this.halt("the parser of \"" + name + "\" can not set '" + splitor + "' as separator.");
        }
        if (this.parsers.hasOwnProperty(name)) {
            return this.halt("the parser of \"" + name + "\" has existed.");
        }
        if (startTag.length === 0) {
            return this.halt("the parser of \"" + name + "\"'s startTag can not be empty. ");
        }
        if (/(\\|:|\s)/.test(startTag.concat(endTag).join(''))) {
            var char = RegExp.$1;
            return this.halt("the parser of \"" + name + "\" contains special char (" + char + ")");
        }
        var rule = config.rule;
        var pairs = [];
        var hasRule = endTag.length === 0 && rule instanceof RegExp;
        if (!hasRule) {
            var sortFn = function (a, b) { return b.length > a.length ? 1 : -1; };
            startTag.sort(sortFn);
            endTag.sort(sortFn);
        }
        var startRuleSegs = [];
        var endRuleSegs = [];
        startTag.map(function (start) {
            if (!hasRule) {
                startRuleSegs.push(utils_1.encodeRegexpChars(start));
            }
            if (endTag.length) {
                endTag.map(function (end) {
                    pairs.push(start + splitor + end);
                    if (!hasRule) {
                        endRuleSegs.push(utils_1.encodeRegexpChars(end));
                    }
                });
            }
            else {
                pairs.push(start);
            }
        });
        for (var i = 0, j = pairs.length; i < j; i++) {
            var cur = pairs[i];
            if (this.tagPairs.indexOf(cur) > -1) {
                var pair = cur.split(splitor);
                return this.halt("the parser of \"" + name + "\"'s start tag \"" + pair[0] + "\" and end tag \"" + pair[1] + "\" has existed.");
            }
            else {
                this.pairHash[cur] = name;
            }
        }
        if (!hasRule) {
            var hasEnd = endTag.length;
            var endWith = "(?=" + config_1.encodeSplitor + "|$)";
            var startWith = "(?:" + startRuleSegs.join('|') + ")";
            var context = void 0;
            if (hasEnd) {
                var endFilter = endRuleSegs.join('|');
                context = "^" + startWith + "(?:\\\\.|[^\\\\](?!" + endFilter + ")|[^\\\\])+?(?:" + endFilter + endWith + ")";
            }
            else {
                context = "^" + startWith + "(?:\\\\.|[^\\\\" + splitor + "])+?" + endWith;
            }
            rule = new RegExp(context);
        }
        this.tagPairs = this.tagPairs.concat(pairs).sort(function (a, b) {
            return a.length - b.length;
        });
        this.parsers[name] = (_a = (function (_super) {
                __extends(class_1, _super);
                function class_1() {
                    var _this = _super.call(this) || this;
                    if (setting) {
                        _this.setting = Object.assign(_this.setting, setting);
                    }
                    return _this;
                }
                class_1.prototype.parse = function () {
                    return parse.call(this);
                };
                return class_1;
            }(ParserInterface)),
            _a.startTag = startTag,
            _a.endTag = endTag,
            _a.separator = separator || '',
            _a.splitor = splitor,
            _a.rule = rule,
            _a.pattern = pattern || null,
            _a);
        var _a;
    };
    Dispatcher.prototype.parse = function (code) {
        var len = code.length;
        var splitor = this.splitor;
        var index = 0;
        var curCode = code;
        var exists = {};
        var result = {};
        while (index < len) {
            var res = this.parseUntilFind(curCode);
            var _a = res, data = _a.data, total = _a.total;
            index += total;
            if (index < len && splitor !== code.charAt(index)) {
                throw new Error("unexpect splitor of \"" + code.slice(index) + "\",expect to be started with splitor \"" + splitor + "\"");
            }
            else {
                curCode = curCode.slice(total + 1);
                index += 1;
            }
            var instance = data.instance, type = data.type;
            if (exists[type] && instance.setting.frozen) {
                throw new Error("the config of \"" + type + "\" (" + instance.code + ") can not be set again.");
            }
            else {
                var curResult = instance.parse();
                if (utils_1.typeOf(curResult) !== 'Array') {
                    result[type] = __assign({}, result[type] || {}, curResult);
                }
                else {
                    result[type] = curResult;
                }
                exists[type] = true;
            }
        }
        return result;
    };
    Dispatcher.prototype.getInstance = function (name) {
        if (this.instances[name]) {
            return this.instances[name].init();
        }
        else {
            return this.instances[name] = new this.parsers[name]();
        }
    };
    Dispatcher.prototype.parseUntilFind = function (context) {
        if (context === '') {
            throw new Error('the context is empty');
        }
        var _a = this, tagPairs = _a.tagPairs, pairHash = _a.pairHash, splitor = _a.splitor, parsers = _a.parsers;
        var exactMatched = [];
        var error = "can not parse context \"" + context + "\",no parser matched.";
        var allMatched = [];
        var startIndex = 0;
        var sub = '';
        var result = null;
        var _loop_1 = function () {
            var cur = context.charAt(startIndex++);
            sub += cur;
            var total = sub.length;
            var isExactFind = false;
            allMatched = tagPairs.filter(function (pair) {
                var flag = pair.indexOf(sub) === 0;
                if (flag && (pair === sub || pair.charAt(total) === splitor)) {
                    isExactFind = true;
                    exactMatched.push(pair);
                }
                return flag;
            });
            if (allMatched.length === 1) {
                if (!isExactFind) {
                    var pair = allMatched[0];
                    var index = pair.indexOf(splitor);
                    var find = index > 0 ? pair.slice(0, index) : pair;
                    if (context.indexOf(find) === 0) {
                        exactMatched.push(pair);
                    }
                }
                return "break";
            }
        };
        do {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        } while (allMatched.length);
        var len = exactMatched.length;
        if (len) {
            var everTested = {};
            var tryTypes = [];
            while (len--) {
                var pair = exactMatched[len];
                var type = pairHash[pair];
                if (everTested[type]) {
                    continue;
                }
                var match = null;
                var parser = parsers[type];
                var rule = parser.rule;
                tryTypes.push(type);
                if (match = context.match(rule)) {
                    var instance = this.getInstance(type);
                    var _b = pair.split(splitor), start = _b[0], end = _b[1];
                    var param = match[0];
                    try {
                        instance.parseCode(param, {
                            start: start,
                            end: end || '',
                        });
                        result = {
                            data: {
                                type: type,
                                instance: instance,
                            },
                            total: param.length,
                        };
                        break;
                    }
                    catch (e) {
                        everTested[type] = true;
                    }
                }
            }
            if (result) {
                return result;
            }
            else {
                throw new Error(error + "[tried types:" + tryTypes.join(',') + "]");
            }
        }
        else {
            throw new Error(error);
        }
    };
    Dispatcher.prototype.halt = function (err) {
        throw new Error(err);
    };
    return Dispatcher;
}());
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=namespace.js.map
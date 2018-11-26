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
var utils_1 = require("../helpers/utils");
var getLastItem = function (arr) {
    return arr[arr.length - 1];
};
var symbols = {
    beginWith: '^',
    endWith: '$',
    matchAny: '.',
    groupBegin: '(',
    groupEnd: ')',
    uncapture: '?:',
    lookahead: '?=',
    lookaheadNot: '?!',
    groupSplitor: '|',
    setBegin: '[',
    setEnd: ']',
    rangeSplitor: '-',
    multipleBegin: '{',
    multipleEnd: '}',
    multipleSplitor: ',',
    translate: '\\',
    leastOne: '+',
    multiple: '*',
    optional: '?',
    setNotIn: '^',
};
var flagsBinary = {
    i: 1,
    u: 2,
    s: 4,
    g: 8,
    m: 16,
    y: 32,
};
var flagItems = Object.keys(flagsBinary).join('');
exports.parserRule = new RegExp("^/(?:\\\\.|[^\\\\](?!/)|[^\\\\])+?/[" + flagItems + "]*");
exports.regexpRule = new RegExp("^/((?:\\\\.|[^\\\\](?!/)|[^\\\\])+?)/([" + flagItems + "]*)$");
var Parser = (function () {
    function Parser(rule, config) {
        if (config === void 0) { config = {}; }
        this.rule = rule;
        this.config = config;
        this.context = '';
        this.flags = [];
        this.lastRule = '';
        this.queues = [];
        this.ruleInput = '';
        this.flagsHash = {};
        this.totalFlagBinary = 0;
        this.rootQueues = [];
        if (exports.regexpRule.test(rule)) {
            this.rule = rule;
            this.context = RegExp.$1;
            this.flags = RegExp.$2 ? RegExp.$2.split('') : [];
            this.checkFlags();
            this.parse();
            this.lastRule = this.ruleInput;
        }
        else {
            throw new Error("wrong regexp:" + rule);
        }
    }
    Parser.prototype.setConfig = function (conf) {
        this.config = conf;
    };
    Parser.prototype.build = function () {
        var rootQueues = this.rootQueues;
        var conf = __assign({}, this.config, { flags: this.flagsHash, namedGroupData: {}, captureGroupData: {}, beginWiths: [], endWiths: [] });
        return rootQueues.reduce(function (res, queue) {
            return res + queue.build(conf);
        }, '');
    };
    Parser.prototype.parse = function () {
        var context = this.context;
        var s = symbols;
        var i = 0;
        var j = context.length;
        var queues = [new RegexpBegin()];
        var groups = [];
        var captureGroups = [];
        var refGroups = {};
        var captureRule = /^(\?(?:<(.+?)>|<=|<!|=|!|:))/;
        var hasFlagU = this.hasFlag('u');
        var groupCaptureIndex = 0;
        var curSet = null;
        var curRange = null;
        while (i < j) {
            var char = context.charAt(i++);
            if ((curRange || curSet) && ['[', '(', ')', '|', '*', '?', '+', '{', '.', '}', '^', '$'].indexOf(char) > -1) {
                var newChar = new RegexpChar(char);
                if (curRange) {
                    newChar.parent = curRange;
                    curRange.add(newChar);
                    curRange = null;
                }
                else {
                    newChar.parent = curSet;
                    if (char === '^' && curSet.isSetStart()) {
                        curSet.reverse = true;
                    }
                    curSet.add(newChar);
                }
                queues.push(newChar);
                continue;
            }
            var nextAll = context.slice(i);
            var lastGroup = getLastItem(groups);
            var lastQueue = getLastItem(queues);
            var target = null;
            var special = null;
            switch (char) {
                case s.translate:
                    var next = context.charAt(i++);
                    var input = char + next;
                    if (next === 'u' || next === 'x') {
                        target = next === 'x' ? new RegexpASCII() : (hasFlagU ? new RegexpUnicodeAll() : new RegexpUnicode());
                        var matchedNum = target.untilEnd(context.slice(i));
                        if (matchedNum === 0) {
                            target = new RegexpIgnore("\\" + next);
                        }
                        else {
                            i += matchedNum;
                        }
                    }
                    else if (next === 'c') {
                        var code = context.charAt(i);
                        if (hasFlagU) {
                            if (/[a-zA-Z]/.test(code)) {
                                target = new RegexpControl(code);
                                i++;
                            }
                            else {
                                throw new Error("invalid unicode escape,unexpect control character[" + i + "]:\\c" + code);
                            }
                        }
                        else {
                            if (/\w/.test(code)) {
                                target = new RegexpControl(code);
                                i++;
                            }
                            else {
                                target = new RegexpChar('\\');
                            }
                        }
                    }
                    else if (['d', 'D', 'w', 'W', 's', 'S', 'b', 'B'].indexOf(next) > -1) {
                        target = new RegexpCharset(input);
                        if (curSet) {
                        }
                    }
                    else if (['t', 'r', 'n', 'f', 'v'].indexOf(next) > -1) {
                        target = new RegexpPrint(input);
                    }
                    else if (/^(\d+)/.test(nextAll)) {
                        var no = RegExp.$1;
                        if (curSet) {
                            if (/^(0[0-7]{1,2}|[1-7][0-7]?)/.test(no)) {
                                var octal = RegExp.$1;
                                target = new RegexpOctal("\\" + octal);
                                i += octal.length - 1;
                            }
                            else {
                                target = new RegexpTranslateChar("\\" + no.charAt(0));
                            }
                        }
                        else {
                            if (no.charAt(0) === '0') {
                                target = new RegexpNull();
                            }
                            else {
                                i += no.length - 1;
                                target = new RegexpReference("\\" + no);
                                var refGroup = captureGroups[+no - 1];
                                refGroups[no] = refGroup;
                                if (refGroup) {
                                    if (refGroup.isAncestorOf(lastGroup)) {
                                        target.ref = null;
                                    }
                                    else {
                                        target.ref = refGroup;
                                    }
                                }
                                else {
                                    target.ref = null;
                                }
                            }
                        }
                    }
                    else {
                        target = new RegexpTranslateChar(input);
                    }
                    break;
                case s.groupBegin:
                    target = new RegexpGroup();
                    if (lastGroup) {
                        target.parent = lastGroup;
                        lastGroup.add(target);
                    }
                    special = new RegexpSpecial('groupBegin');
                    groups.push(target);
                    if (captureRule.test(nextAll)) {
                        var all = RegExp.$1, captureName = RegExp.$2;
                        if (all === '?:') {
                        }
                        else if (captureName) {
                            target.captureIndex = ++groupCaptureIndex;
                            target.captureName = captureName;
                        }
                        else {
                            throw new Error("do not use any lookahead\\lookbehind:" + all);
                        }
                        i += all.length;
                    }
                    else {
                        target.captureIndex = ++groupCaptureIndex;
                    }
                    if (target.captureIndex > 0) {
                        captureGroups.push(target);
                    }
                    break;
                case s.groupEnd:
                    var last = groups.pop();
                    if (last) {
                        last.isComplete = true;
                        special = new RegexpSpecial('groupEnd');
                        special.parent = last;
                    }
                    else {
                        throw new Error("unmatched " + char + ",you mean \"\\" + char + "\"?");
                    }
                    break;
                case s.groupSplitor:
                    var group = getLastItem(groups);
                    if (!group) {
                        target = new RegexpGroup();
                        target.isRoot = true;
                        target.addNewGroup(queues.slice(0));
                        queues.splice(0, queues.length, target);
                        groups.push(target);
                        special = new RegexpSpecial('groupSplitor');
                    }
                    else {
                        group.addNewGroup();
                    }
                    break;
                case s.setBegin:
                    if (/^\\b]/.test(nextAll)) {
                        target = new RegexpBackspace();
                        i += 3;
                    }
                    else {
                        target = new RegexpSet();
                        curSet = target;
                    }
                    special = new RegexpSpecial('setBegin');
                    break;
                case s.setEnd:
                    if (curSet) {
                        curSet.isComplete = true;
                        special = new RegexpSpecial('setEnd');
                        special.parent = curSet;
                        curSet = null;
                    }
                    else {
                        target = new RegexpChar(char);
                    }
                    break;
                case s.rangeSplitor:
                    if (curSet) {
                        if (lastQueue.type === 'special' && lastQueue.special === 'setBegin') {
                            target = new RegexpChar(char);
                        }
                        else {
                            var nextChar = nextAll.charAt(0);
                            if (nextChar === s.setEnd) {
                                curSet.isComplete = true;
                                curSet = null;
                                i += 1;
                            }
                            else {
                                var first = curSet.pop();
                                target = new RegexpRange();
                                target.add(first);
                                lastQueue.parent = target;
                                special = queues.pop();
                                curRange = target;
                            }
                        }
                    }
                    else {
                        target = new RegexpChar(char);
                    }
                    break;
                case s.multipleBegin:
                case s.optional:
                case s.multiple:
                case s.leastOne:
                    target = char === s.multipleBegin ? new RegexpTimesMulti() : new RegexpTimesQuantifiers();
                    var num = target.untilEnd(context.slice(i - 1));
                    if (num > 0) {
                        var type = lastQueue.special || lastQueue.type;
                        var error = "[" + lastQueue.input + "]nothing to repeat[index:" + i + "]:" + context.slice(i - 1, i - 1 + num);
                        if (type === 'groupStart' || type === 'groupSplitor' || type === 'times' || type === 'multipleOptional' || type === 'begin' || (type === 'charset' && lastQueue.charset.toLowerCase() === 'b')) {
                            throw new Error(error);
                        }
                        else if (type === 'multipleEnd') {
                            if (char === s.optional) {
                                target = new RegexpIgnore('\\?');
                                special = new RegexpSpecial('multipleOptional');
                            }
                            else {
                                throw new Error(error);
                            }
                        }
                        else {
                            i += num - 1;
                            if (char === s.multipleBegin || char === s.optional) {
                                special = new RegexpSpecial('multipleEnd');
                            }
                            if (type === 'groupEnd' || type === 'setEnd') {
                                target.target = lastQueue.parent;
                            }
                            else {
                                target.target = lastQueue;
                            }
                        }
                    }
                    else {
                        target = new RegexpChar(char);
                    }
                    break;
                case s.matchAny:
                    target = new RegexpAny();
                    break;
                default:
                    target = new RegexpChar(char);
            }
            if (target) {
                var cur = target;
                queues.push(cur);
                if (curRange && curRange.isComplete === false && curRange !== target) {
                    target.parent = curRange;
                    curRange.add(target);
                    curRange = null;
                }
                else if (curSet && curSet !== cur) {
                    cur.parent = curSet;
                    curSet.add(cur);
                }
                else if (groups.length) {
                    var group = getLastItem(groups);
                    if (group !== cur) {
                        cur.parent = group;
                        group.add(cur);
                    }
                }
            }
            if (special) {
                if (target) {
                    special.parent = target;
                }
                queues.push(special);
            }
        }
        if (queues.length === 1 && queues[0].type === 'group') {
            var group = queues[0];
            if (group.isRoot = true) {
                group.isComplete = true;
            }
        }
        var rootQueues = [];
        var ruleInput = '';
        queues.every(function (queue) {
            if (!queue.isComplete) {
                throw new Error("the regexp segment " + queue.type + " is not completed:" + queue.input);
            }
            if (queue.parent === null) {
                rootQueues.push(queue);
                ruleInput += queue.getRuleInput();
            }
            return true;
        });
        this.ruleInput = ruleInput;
        this.rootQueues = rootQueues;
        this.queues = queues;
    };
    Parser.prototype.checkFlags = function () {
        var flags = this.flags;
        var len = flags.length;
        if (len === 0) {
            return;
        }
        if (len > Object.keys(flagsBinary).length) {
            throw new Error("the rule has repeat flag,please check.");
        }
        var first = flags[0];
        var totalFlagBinary = flagsBinary[first];
        var flagsHash = (_a = {},
            _a[first] = true,
            _a);
        for (var i = 1, j = flags.length; i < j; i++) {
            var flag = flags[i];
            var binary = flagsBinary[flag];
            if ((totalFlagBinary & binary) === 0) {
                totalFlagBinary += binary;
                flagsHash[flag] = true;
            }
            else {
                throw new Error("wrong flag[" + i + "]:" + flag);
            }
        }
        this.flagsHash = flagsHash;
        this.totalFlagBinary = totalFlagBinary;
        if (flagsHash.y || flagsHash.m || flagsHash.g) {
            console.warn("the flags of 'g','m','y' will ignore,but you can set flags such as 'i','u','s'");
        }
        var _a;
    };
    Parser.prototype.hasFlag = function (flag) {
        var totalFlagBinary = this.totalFlagBinary;
        var binary = flagsBinary[flag];
        return binary && (binary & totalFlagBinary) !== 0;
    };
    return Parser;
}());
exports.default = Parser;
var CharsetHelper = (function () {
    function CharsetHelper() {
        this.points = {
            d: [[48, 57]],
            w: [[48, 57], [65, 90], [95], [97, 122]],
            s: [[0x0009, 0x000c], [0x0020], [0x00a0], [0x1680], [0x180e],
                [0x2000, 0x200a], [0x2028, 0x2029], [0x202f], [0x205f], [0x3000], [0xfeff],
            ],
        };
        this.lens = {
            d: [10],
            w: [10, 36, 37, 63],
            s: [4, 5, 6, 7, 8, 18, 20, 21, 22, 23, 24],
        };
        this.bigCharPoint = [0x10000, 0x10ffff];
        this.bigCharTotal = 0x10ffff - 0x10000 + 1;
        this.cache = {};
    }
    CharsetHelper.prototype.make = function (type, flags) {
        if (flags === void 0) { flags = {}; }
        var result;
        var ranges;
        var totals;
        if (['w', 'd', 's'].indexOf(type) > -1) {
            result = this.charsetOf(type);
            ranges = result.ranges;
            totals = result.totals;
        }
        else {
            if (type === '.') {
                if (flags.s) {
                    result = this.charsetOfDotall();
                }
                else {
                    result = this.charsetOfAll();
                }
            }
            else {
                result = this.charsetOfNegated(type);
            }
            ranges = result.ranges;
            totals = result.totals;
            if (flags.u) {
                ranges = ranges.concat([this.bigCharPoint]);
                totals = totals.slice(0).concat(this.bigCharTotal);
            }
        }
        var total = getLastItem(totals);
        var rand = utils_1.makeRandom(1, total);
        var nums = totals.length;
        var codePoint;
        var index = 0;
        while (nums > 1) {
            var avg = Math.floor(nums / 2);
            var prev = totals[index + avg - 1];
            var next = totals[index + avg];
            if (rand >= prev && rand <= next) {
                index += avg - (rand === prev ? 1 : 0);
                break;
            }
            else {
                if (rand > next) {
                    index += avg + 1;
                    nums -= (avg + 1);
                }
                else {
                    nums -= avg;
                }
            }
        }
        codePoint = ranges[index][0] + (rand - (totals[index - 1] || 0)) - 1;
        return String.fromCodePoint(codePoint);
    };
    CharsetHelper.prototype.charsetOfAll = function () {
        return this.charsetOfNegated('ALL');
    };
    CharsetHelper.prototype.charsetOfDotall = function () {
        return this.charsetOfNegated('DOTALL');
    };
    CharsetHelper.prototype.charsetOfNegated = function (type) {
        var _a = this, points = _a.points, cache = _a.cache;
        if (cache[type]) {
            return cache[type];
        }
        else {
            var start = 0x0000;
            var max = 0xDBFF;
            var nextStart = 0xE000;
            var nextMax = 0xFFFF;
            var ranges_1 = [];
            var totals_1 = [];
            var total_1 = 0;
            var add = function (begin, end) {
                var num = end - begin + 1;
                if (num <= 0) {
                    return;
                }
                else if (num === 1) {
                    ranges_1.push([begin]);
                }
                else {
                    ranges_1.push([begin, end]);
                }
                total_1 += num;
                totals_1.push(total_1);
            };
            if (type === 'DOTALL') {
                add(start, max);
                add(nextStart, nextMax);
            }
            else {
                var excepts = type === 'ALL' ? [[0x000a], [0x000d], [0x2028, 0x2029]] : points[type.toLowerCase()];
                var specialNum = type === 'S' ? 1 : 0;
                while (start <= max && excepts.length > specialNum) {
                    var _b = excepts.shift(), begin = _b[0], end = _b[1];
                    add(start, begin - 1);
                    start = (end || begin) + 1;
                }
                if (start < max) {
                    add(start, max);
                }
                if (type === 'S') {
                    var last = getLastItem(excepts)[0];
                    add(nextStart, last - 1);
                    add(last + 1, nextMax);
                }
                else {
                    add(nextStart, nextMax);
                }
            }
            return (cache[type] = {
                ranges: ranges_1,
                totals: totals_1,
            });
        }
    };
    CharsetHelper.prototype.charsetOf = function (type) {
        var _a = this, lens = _a.lens, points = _a.points;
        return {
            ranges: points[type],
            totals: lens[type],
        };
    };
    return CharsetHelper;
}());
var charsetHelper = new CharsetHelper();
var RegexpPart = (function () {
    function RegexpPart(input) {
        if (input === void 0) { input = ''; }
        this.input = input;
        this.queues = [];
        this.isComplete = true;
        this.parent = null;
        this.buildForTimes = false;
        this.min = 1;
        this.max = 1;
        this.curCodePoint = 0;
        this.dataConf = {};
    }
    Object.defineProperty(RegexpPart.prototype, "codePoint", {
        get: function () {
            return this.curCodePoint;
        },
        set: function (point) {
            this.curCodePoint = point;
        },
        enumerable: true,
        configurable: true
    });
    RegexpPart.prototype.setRange = function (options) {
        var _this = this;
        Object.keys(options).forEach(function (key) {
            _this[key] = options[key];
        });
    };
    RegexpPart.prototype.add = function (target, options) {
    };
    RegexpPart.prototype.pop = function () {
        return this.queues.pop();
    };
    RegexpPart.prototype.build = function (conf) {
        var _this = this;
        var _a = this, min = _a.min, max = _a.max;
        var result = '';
        if (min === 0 && max === 0) {
        }
        else {
            var total = min + Math.floor(Math.random() * (max - min + 1));
            if (total !== 0) {
                var makeOnce = function () {
                    var cur = _this.prebuild(conf);
                    if (conf.flags && conf.flags.i) {
                        cur = utils_1.isOptional() ? (utils_1.isOptional() ? cur.toLowerCase() : cur.toUpperCase()) : cur;
                    }
                    return cur;
                };
                if (!this.buildForTimes) {
                    result = makeOnce().repeat(total);
                }
                else {
                    while (total--) {
                        result += makeOnce();
                    }
                }
            }
        }
        this.dataConf = conf;
        this.setDataConf(conf, result);
        return result;
    };
    RegexpPart.prototype.setDataConf = function (conf, result) {
    };
    RegexpPart.prototype.toString = function () {
        return this.input;
    };
    RegexpPart.prototype.untilEnd = function (context) {
    };
    RegexpPart.prototype.isAncestorOf = function (target) {
        do {
            if (target === this) {
                return true;
            }
        } while (target = (target ? target.parent : null));
        return false;
    };
    RegexpPart.prototype.getRuleInput = function (parseReference) {
        if (this.queues.length) {
            return this.buildRuleInputFromQueues();
        }
        else {
            return this.input;
        }
    };
    RegexpPart.prototype.buildRuleInputFromQueues = function () {
        return this.queues.reduce(function (result, next) {
            return result + next.getRuleInput();
        }, '');
    };
    RegexpPart.prototype.prebuild = function (conf) {
        if (this.queues.length) {
            return this.queues.reduce(function (res, cur) {
                return res + cur.build(conf);
            }, '');
        }
        else {
            return '';
        }
    };
    return RegexpPart;
}());
var RegexpEmpty = (function (_super) {
    __extends(RegexpEmpty, _super);
    function RegexpEmpty(input) {
        var _this = _super.call(this, input) || this;
        _this.min = 0;
        _this.max = 0;
        return _this;
    }
    return RegexpEmpty;
}(RegexpPart));
var RegexpOrigin = (function (_super) {
    __extends(RegexpOrigin, _super);
    function RegexpOrigin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RegexpOrigin.prototype.prebuild = function () {
        return this.input;
    };
    return RegexpOrigin;
}(RegexpPart));
var RegexpReference = (function (_super) {
    __extends(RegexpReference, _super);
    function RegexpReference(input) {
        var _this = _super.call(this, input) || this;
        _this.type = 'reference';
        _this.ref = null;
        _this.index = Number("" + input.slice(1));
        return _this;
    }
    RegexpReference.prototype.prebuild = function (conf) {
        var ref = this.ref;
        if (ref === null) {
            return '';
        }
        else {
            var captureIndex = ref.captureIndex;
            var captureGroupData = conf.captureGroupData;
            return captureGroupData[captureIndex];
        }
    };
    return RegexpReference;
}(RegexpPart));
var RegexpSpecial = (function (_super) {
    __extends(RegexpSpecial, _super);
    function RegexpSpecial(special) {
        var _this = _super.call(this) || this;
        _this.special = special;
        _this.type = 'special';
        return _this;
    }
    return RegexpSpecial;
}(RegexpEmpty));
var RegexpAny = (function (_super) {
    __extends(RegexpAny, _super);
    function RegexpAny() {
        var _this = _super.call(this, '.') || this;
        _this.type = 'any';
        _this.buildForTimes = true;
        return _this;
    }
    RegexpAny.prototype.prebuild = function (conf) {
        return charsetHelper.make('.', conf.flags);
    };
    return RegexpAny;
}(RegexpPart));
var RegexpNull = (function (_super) {
    __extends(RegexpNull, _super);
    function RegexpNull() {
        var _this = _super.call(this, '\\0') || this;
        _this.type = 'null';
        return _this;
    }
    RegexpNull.prototype.prebuild = function () {
        return '\x00';
    };
    return RegexpNull;
}(RegexpPart));
var RegexpBackspace = (function (_super) {
    __extends(RegexpBackspace, _super);
    function RegexpBackspace() {
        var _this = _super.call(this, '[\\b]') || this;
        _this.type = 'backspace';
        return _this;
    }
    RegexpBackspace.prototype.prebuild = function () {
        return '\u0008';
    };
    return RegexpBackspace;
}(RegexpPart));
var RegexpBegin = (function (_super) {
    __extends(RegexpBegin, _super);
    function RegexpBegin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'begin';
        return _this;
    }
    return RegexpBegin;
}(RegexpEmpty));
var RegexpControl = (function (_super) {
    __extends(RegexpControl, _super);
    function RegexpControl(input) {
        var _this = _super.call(this, "\\c" + input) || this;
        _this.type = 'control';
        _this.codePoint = parseInt(input.charCodeAt(0).toString(2).slice(-5), 2);
        return _this;
    }
    RegexpControl.prototype.prebuild = function () {
        return String.fromCharCode(this.codePoint);
    };
    return RegexpControl;
}(RegexpPart));
var RegexpCharset = (function (_super) {
    __extends(RegexpCharset, _super);
    function RegexpCharset(input) {
        var _this = _super.call(this, input) || this;
        _this.type = 'charset';
        _this.charset = _this.input.slice(-1);
        _this.buildForTimes = true;
        return _this;
    }
    RegexpCharset.prototype.prebuild = function (conf) {
        var charset = this.charset;
        if (charset === 'b' || charset === 'B') {
            console.warn('please do not use \\b or \\B');
            return '';
        }
        else {
            return charsetHelper.make(charset, conf.flags);
        }
    };
    return RegexpCharset;
}(RegexpPart));
var RegexpPrint = (function (_super) {
    __extends(RegexpPrint, _super);
    function RegexpPrint() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'print';
        return _this;
    }
    RegexpPrint.prototype.prebuild = function () {
        return this.input;
    };
    return RegexpPrint;
}(RegexpPart));
var RegexpIgnore = (function (_super) {
    __extends(RegexpIgnore, _super);
    function RegexpIgnore() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'ignore';
        return _this;
    }
    RegexpIgnore.prototype.prebuild = function () {
        console.warn("the \"" + this.input + "\" will ignore.");
        return '';
    };
    return RegexpIgnore;
}(RegexpEmpty));
var RegexpChar = (function (_super) {
    __extends(RegexpChar, _super);
    function RegexpChar(input) {
        var _this = _super.call(this, input) || this;
        _this.type = 'char';
        _this.codePoint = input.codePointAt(0);
        return _this;
    }
    return RegexpChar;
}(RegexpOrigin));
var RegexpTranslateChar = (function (_super) {
    __extends(RegexpTranslateChar, _super);
    function RegexpTranslateChar(input) {
        var _this = _super.call(this, input) || this;
        _this.type = 'translate';
        _this.codePoint = input.slice(-1).codePointAt(0);
        return _this;
    }
    RegexpTranslateChar.prototype.prebuild = function () {
        return this.input.slice(-1);
    };
    return RegexpTranslateChar;
}(RegexpOrigin));
var RegexpOctal = (function (_super) {
    __extends(RegexpOctal, _super);
    function RegexpOctal(input) {
        var _this = _super.call(this, input) || this;
        _this.type = 'octal';
        _this.codePoint = Number("0o" + input.slice(1));
        return _this;
    }
    RegexpOctal.prototype.prebuild = function () {
        return String.fromCodePoint(this.codePoint);
    };
    return RegexpOctal;
}(RegexpPart));
var RegexpTimes = (function (_super) {
    __extends(RegexpTimes, _super);
    function RegexpTimes() {
        var _this = _super.call(this) || this;
        _this.type = 'times';
        _this.maxNum = 5;
        _this.greedy = true;
        _this.minRepeat = 0;
        _this.maxRepeat = 0;
        _this.isComplete = false;
        return _this;
    }
    Object.defineProperty(RegexpTimes.prototype, "target", {
        set: function (target) {
            target.setRange({
                min: this.minRepeat,
                max: this.maxRepeat,
            });
        },
        enumerable: true,
        configurable: true
    });
    RegexpTimes.prototype.untilEnd = function (context) {
        if (this.rule.test(context)) {
            var all = RegExp.$1;
            this.isComplete = true;
            this.input = all;
            this.parse();
            return all.length;
        }
        return 0;
    };
    return RegexpTimes;
}(RegexpPart));
var RegexpTimesMulti = (function (_super) {
    __extends(RegexpTimesMulti, _super);
    function RegexpTimesMulti() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rule = /^(\{(\d+)(,(\d*))?})/;
        return _this;
    }
    RegexpTimesMulti.prototype.parse = function () {
        var min = RegExp.$2, code = RegExp.$3, max = RegExp.$4;
        this.minRepeat = parseInt(min, 10);
        this.maxRepeat = Number(max) ? parseInt(max, 10) : (code ? this.minRepeat + this.maxNum * 2 : this.minRepeat);
    };
    return RegexpTimesMulti;
}(RegexpTimes));
var RegexpTimesQuantifiers = (function (_super) {
    __extends(RegexpTimesQuantifiers, _super);
    function RegexpTimesQuantifiers() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rule = /^(\*\?|\+\?|\*|\+|\?)/;
        return _this;
    }
    RegexpTimesQuantifiers.prototype.parse = function () {
        var all = RegExp.$1;
        this.greedy = all.length === 1;
        switch (all.charAt(0)) {
            case '*':
                this.maxRepeat = this.maxNum;
                break;
            case '+':
                this.minRepeat = 1;
                this.maxRepeat = this.maxNum;
                break;
            case '?':
                this.maxRepeat = 1;
                break;
        }
    };
    return RegexpTimesQuantifiers;
}(RegexpTimes));
var RegexpSet = (function (_super) {
    __extends(RegexpSet, _super);
    function RegexpSet() {
        var _this = _super.call(this) || this;
        _this.type = 'set';
        _this.reverse = false;
        _this.isComplete = false;
        _this.buildForTimes = true;
        return _this;
    }
    RegexpSet.prototype.add = function (target) {
        var queues = this.queues;
        queues.push(target);
    };
    RegexpSet.prototype.isSetStart = function () {
        return this.queues.length === 0;
    };
    RegexpSet.prototype.getRuleInput = function () {
        return '[' + this.buildRuleInputFromQueues() + ']';
    };
    RegexpSet.prototype.prebuild = function (conf) {
        var index = utils_1.makeRandom(0, this.queues.length - 1);
        return this.queues[index].build(conf);
    };
    return RegexpSet;
}(RegexpPart));
var RegexpRange = (function (_super) {
    __extends(RegexpRange, _super);
    function RegexpRange() {
        var _this = _super.call(this) || this;
        _this.type = 'range';
        _this.isComplete = false;
        return _this;
    }
    RegexpRange.prototype.add = function (target) {
        var queues = this.queues;
        var total = queues.length;
        if (total === 1) {
            this.isComplete = true;
        }
        this.queues.push(target);
    };
    RegexpRange.prototype.getRuleInput = function () {
        var _a = this.queues, prev = _a[0], next = _a[1];
        return prev.getRuleInput() + '-' + next.getRuleInput();
    };
    RegexpRange.prototype.prebuild = function () {
        var _a = this.queues, prev = _a[0], next = _a[1];
        var min = prev.codePoint;
        var max = next.codePoint;
        return String.fromCodePoint(utils_1.makeRandom(min, max));
    };
    return RegexpRange;
}(RegexpPart));
var RegexpHexCode = (function (_super) {
    __extends(RegexpHexCode, _super);
    function RegexpHexCode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'hexcode';
        return _this;
    }
    RegexpHexCode.prototype.untilEnd = function (context) {
        var _a = this, rule = _a.rule, codeType = _a.codeType;
        if (rule.test(context)) {
            var all = RegExp.$1, codePoint = RegExp.$2;
            var lastCode = codePoint || all;
            this.codePoint = Number("0x" + lastCode);
            this.input = "\\" + codeType + all;
        }
        return 0;
    };
    return RegexpHexCode;
}(RegexpOrigin));
var RegexpUnicode = (function (_super) {
    __extends(RegexpUnicode, _super);
    function RegexpUnicode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rule = /^([0-9A-Fa-f]{4})/;
        _this.codeType = 'u';
        return _this;
    }
    return RegexpUnicode;
}(RegexpHexCode));
var RegexpUnicodeAll = (function (_super) {
    __extends(RegexpUnicodeAll, _super);
    function RegexpUnicodeAll() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rule = /^({([0-9A-Fa-f]{4}|[0-9A-Fa-f]{6})}|[0-9A-Fa-f]{2})/;
        _this.codeType = 'u';
        return _this;
    }
    return RegexpUnicodeAll;
}(RegexpHexCode));
var RegexpASCII = (function (_super) {
    __extends(RegexpASCII, _super);
    function RegexpASCII() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rule = /^([0-9A-Fa-f]{2})/;
        _this.codeType = 'x';
        return _this;
    }
    return RegexpASCII;
}(RegexpHexCode));
var RegexpGroup = (function (_super) {
    __extends(RegexpGroup, _super);
    function RegexpGroup() {
        var _this = _super.call(this) || this;
        _this.type = 'group';
        _this.captureIndex = 0;
        _this.groupIndex = 0;
        _this.captureName = '';
        _this.isRoot = false;
        _this.groups = [[]];
        _this.curRule = null;
        _this.isComplete = false;
        return _this;
    }
    RegexpGroup.prototype.addNewGroup = function (queue) {
        var groups = this.groups;
        if (queue) {
            groups[groups.length - 1] = queue;
        }
        this.groups.push([]);
    };
    RegexpGroup.prototype.add = function (target) {
        var groups = this.groups;
        var last = getLastItem(groups);
        last.push(target);
    };
    RegexpGroup.prototype.isGroupStart = function () {
        return this.groups[this.groups.length - 1].length === 0;
    };
    RegexpGroup.prototype.getRuleInput = function (parseReference) {
        var _this = this;
        var _a = this, groups = _a.groups, captureIndex = _a.captureIndex, isRoot = _a.isRoot;
        var result = '';
        var segs = groups.map(function (group) {
            if (group.length === 0) {
                return '';
            }
            else {
                return group.reduce(function (res, item) {
                    var cur;
                    if (parseReference && item.type === 'reference' && item.ref !== null) {
                        cur = item.ref.getRuleInput(parseReference);
                    }
                    else {
                        cur = _this.isEndLimitChar(item) ? '' : item.getRuleInput(parseReference);
                    }
                    return res + cur;
                }, '');
            }
        });
        if (captureIndex === 0) {
            result = '?:' + result;
        }
        result += segs.join('|');
        return isRoot ? result : "(" + result + ")";
    };
    RegexpGroup.prototype.buildRule = function (flags) {
        if (this.curRule) {
            return this.curRule;
        }
        else {
            var rule = this.getRuleInput(true);
            var flag = Object.keys(flags).join('');
            return new Function('', "return /^" + rule + "$/" + flag)();
        }
    };
    RegexpGroup.prototype.prebuild = function (conf) {
        var _this = this;
        var _a = this, groups = _a.groups, captureIndex = _a.captureIndex, captureName = _a.captureName;
        var result = '';
        var flags = conf.flags, namedGroupConf = conf.namedGroupConf;
        var groupsLen = groups.length;
        var filterGroups = (function () {
            var curGroups = [];
            if (captureName && captureName.indexOf(':') > -1 && namedGroupConf) {
                var segs = captureName.split(':');
                if (segs.length === groupsLen) {
                    var notInIndexs_1 = [];
                    var inIndexs_1 = [];
                    segs.forEach(function (key, index) {
                        if (typeof namedGroupConf[key] === 'boolean') {
                            (namedGroupConf[key] === true ? inIndexs_1 : notInIndexs_1).push(index);
                        }
                    });
                    var lastIndexs = [];
                    if (inIndexs_1.length) {
                        lastIndexs = inIndexs_1;
                    }
                    else if (notInIndexs_1.length && notInIndexs_1.length < groupsLen) {
                        for (var i = 0; i < groupsLen; i++) {
                            if (notInIndexs_1.indexOf(i) < 0) {
                                lastIndexs.push(i);
                            }
                        }
                    }
                    if (lastIndexs.length) {
                        curGroups = lastIndexs.map(function (index) { return groups[index]; });
                    }
                }
            }
            return curGroups;
        })();
        if (captureName && namedGroupConf && namedGroupConf[captureName]) {
            var curRule = this.buildRule(flags);
            var index = utils_1.makeRandom(0, namedGroupConf[captureName].length - 1);
            result = namedGroupConf[captureName][index];
            if (!curRule.test(result)) {
                throw new Error("the namedGroupConf of " + captureName + "'s value \"" + result + "\" is not match the rule " + curRule.toString());
            }
        }
        else {
            var lastGroups = filterGroups.length ? filterGroups : groups;
            var index = utils_1.makeRandom(0, lastGroups.length - 1);
            var group = lastGroups[index];
            if (group.length === 0) {
                result = '';
            }
            else {
                result = group.reduce(function (res, queue) {
                    var cur;
                    if (_this.isEndLimitChar(queue)) {
                        console.warn('the ^ and $ of the regexp will ignore');
                        cur = '';
                    }
                    else {
                        cur = queue.build(conf);
                    }
                    return res + cur;
                }, '');
            }
        }
        if (captureName) {
            conf.namedGroupData[captureName] = result;
        }
        if (captureIndex) {
            conf.captureGroupData[captureIndex] = result;
        }
        return result;
    };
    RegexpGroup.prototype.isEndLimitChar = function (target) {
        return target.type === 'char' && (target.input === '^' || target.input === '$');
    };
    return RegexpGroup;
}(RegexpPart));
//# sourceMappingURL=regexp.js.map
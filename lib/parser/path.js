"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['&'],
        endTag: [],
        separator: ',',
        pattern: /^(\.{1,2}(?:\/\.\.)*|<\w+?>)?((?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+)/,
        rule: /^&(?:(?:\.{1,2}(?:\/\.\.)*|<\w+?>)?(?:\/(?:[^.\/\\<>*?:,]|\.(?![.\/,]|$))+)+(?=(,)|:|$)\1?)+/,
    },
    parse: function () {
        var _a = this.info(), patterns = _a.patterns, code = _a.code;
        if (!patterns.length) {
            this.halt("no path params found:" + code);
        }
        var result = [];
        patterns.forEach(function (match) {
            var fullpath = match[0], prefix = match[1], curPath = match[2];
            var relative = !!prefix;
            var variable = relative && prefix.charAt(0) === '<' ? prefix.slice(1, -1) : undefined;
            var depth = 0;
            if (relative && !variable) {
                var segs = prefix.split('/');
                depth = segs.length - (segs[0] === '.' ? 1 : 0);
            }
            var cur = {
                relative: relative,
                path: curPath.split('/').slice(1),
                depth: depth,
                fullpath: fullpath,
                variable: variable,
            };
            result.push(cur);
        });
        return result;
    },
};
exports.default = parser;
//# sourceMappingURL=path.js.map
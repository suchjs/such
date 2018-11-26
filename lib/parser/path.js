"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var parser = {
    config: {
        startTag: ['&'],
        endTag: [],
        separator: ',',
        pattern: new RegExp("^(\\.(?:\\/(?=\\.)|))?((?:\\.\\.(?:\\/(?=\\.)|))*)((?:\\/(?:\\\\.|[^,\\\\" + config_1.encodeSplitor + "\\/])+)+)"),
        rule: new RegExp("^&(?:(?:\\.(?:\\/(?=\\.)|))?(?:\\.\\.(?:\\/(?=\\.)|))*(?:\\/(?:\\\\.|[^,\\\\" + config_1.encodeSplitor + "\\/])+)+?(?:,(?=\\/|\\.)|(?=$|" + config_1.encodeSplitor + ")))+"),
    },
    parse: function () {
        var _a = this.info(), patterns = _a.patterns, code = _a.code;
        if (!patterns.length) {
            this.halt("no path params found:" + code);
        }
        var result = [];
        patterns.forEach(function (match) {
            var fullpath = match[0], lookParent = match[1], lookDepth = match[2], curPath = match[3];
            var relative = !!(lookDepth || lookParent);
            var cur = {
                relative: relative,
                path: curPath.split('/').slice(1),
                depth: relative && lookDepth ? lookDepth.split('/').length : 0,
                fullpath: fullpath,
            };
            result.push(cur);
        });
        return result;
    },
};
exports.default = parser;
//# sourceMappingURL=path.js.map
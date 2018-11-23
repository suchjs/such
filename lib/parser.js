"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./helpers/utils");
var ParserList = require("./parser/index");
var namespace_1 = require("./parser/namespace");
var dispatcher = new namespace_1.Dispatcher();
utils_1.map(ParserList, function (item, key) {
    if (key.indexOf('_') === 0) {
        return;
    }
    dispatcher.addParser(key, item.config, item.parse, item.setting || {});
});
exports.default = dispatcher;
//# sourceMappingURL=parser.js.map
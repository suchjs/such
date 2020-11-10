"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var size_1 = require("../parser/size");
var length_1 = require("../parser/length");
var format_1 = require("../parser/format");
var config_1 = require("../parser/config");
var func_1 = require("../parser/func");
var regexp_1 = require("../parser/regexp");
var path_1 = require("../parser/path");
var parser_1 = require("../core/parser");
var ParserList = { Size: size_1.default, Length: length_1.default, Format: format_1.default, Config: config_1.default, Func: func_1.default, Regexp: regexp_1.default, Path: path_1.default };
var dispatcher = new parser_1.Dispatcher();
Object.keys(ParserList).map(function (key) {
    var item = ParserList[key];
    dispatcher.addParser(key, item.config, item.parse, item.setting || {});
});
exports.default = dispatcher;
//# sourceMappingURL=parser.js.map
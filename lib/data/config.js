"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strRule = exports.suchRule = exports.encodeSplitor = exports.splitor = void 0;
var utils_1 = require("../helpers/utils");
exports.splitor = ':';
exports.encodeSplitor = utils_1.encodeRegexpChars(exports.splitor);
exports.suchRule = new RegExp("^" + exports.encodeSplitor + "([A-Za-z][\\w$-]*)");
exports.strRule = /^(["'])((?:(?!\1)[^\\]|\\.)*)\1$/;
//# sourceMappingURL=config.js.map
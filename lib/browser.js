"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var recommend_1 = require("./config/recommend");
var such_1 = require("./such");
such_1.default.config(recommend_1.default);
window.Such = such_1.default;
//# sourceMappingURL=browser.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaySchema = exports.Plan = void 0;
const zod_1 = require("zod");
//enum
exports.Plan = zod_1.z.enum([
    "BASIC_NORMAL",
    "CUSTOMIZED_NORMAL",
    "BASIC_PRIME",
    "CUSTOMIZED_PRIME",
]);
exports.PaySchema = zod_1.z.object({
    plan: exports.Plan,
});

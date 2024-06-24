"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportyProfile = void 0;
const zod_1 = require("zod");
exports.SportyProfile = zod_1.z.object({
    phone: zod_1.z.string().min(11).max(20),
    password: zod_1.z.string(),
});

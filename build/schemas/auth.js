"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.SignUpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).min(3),
    username: zod_1.z.string().max(6),
    firstname: zod_1.z.string().min(3),
    lastname: zod_1.z.string().min(3),
    referral: zod_1.z.string(),
});

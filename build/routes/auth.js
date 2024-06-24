"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
require("express-async-errors");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_1 = require("../schemas/auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const error_1 = require("../types/error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
router.post("/", (0, validation_middleware_1.validateRequest)(auth_1.SignUpSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    if (yield prisma_1.default.user.findUnique({ where: { email: data.email } })) {
        throw new error_1.ApiError("Email already used", 400);
    }
    else {
        if (yield prisma_1.default.user.findUnique({ where: { username: data.username } })) {
            throw new error_1.ApiError("Username already used", 400);
        }
        let referredBy = yield prisma_1.default.user.findUnique({
            where: {
                username: data.referral,
            },
        });
        if (!referredBy) {
            throw new error_1.ApiError("Referral does not exist", 400);
        }
        else {
            let hashedPassword = yield bcrypt_1.default.hash(data.password, 10);
            const user = yield prisma_1.default.user.create({
                data: {
                    email: data.email,
                    username: data.username,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    password: hashedPassword,
                    referee: {
                        connect: {
                            id: referredBy.id,
                        },
                    },
                },
            });
            res.json({
                message: "User created successfully",
                data: {
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                },
            });
        }
    }
}));
router.post("/login", (0, validation_middleware_1.validateRequest)(auth_1.LoginSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new error_1.ApiError("Email does not exist", 400);
    }
    const passwordMatch = yield bcrypt_1.default.compare(data.password, user.password);
    if (!passwordMatch) {
        throw new error_1.ApiError("Incorrect Password", 400);
    }
    const token = jsonwebtoken_1.default.sign({ email: user.email, id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "10h",
    });
    res.json({
        message: "Login successful",
        data: {
            token: token,
        },
    });
}));
exports.default = router;

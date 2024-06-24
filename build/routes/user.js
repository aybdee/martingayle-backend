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
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const payment_1 = require("../schemas/payment");
const sporty_1 = require("../schemas/sporty");
const payment_2 = __importDefault(require("../utils/payment"));
const router = (0, express_1.Router)();
router.get("/referrals", auth_middleware_1.verifySession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        include: {
            referrals: true,
        },
    });
    if (!(user === null || user === void 0 ? void 0 : user.referrals)) {
        res.json({
            message: "No referrals",
        });
    }
    res.json({
        message: "Referrals",
        data: user === null || user === void 0 ? void 0 : user.referrals.map((referral) => {
            return {
                email: referral.email,
                firstname: referral.firstname,
                lastname: referral.lastname,
                plan: referral.currentPlan,
                joinDate: referral.createdAt,
            };
        }),
    });
}));
router.get("/sportyprofile/", auth_middleware_1.verifySession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        include: {
            sportyProfile: {
                select: {
                    phone: true,
                    password: true,
                },
            },
        },
    });
    if (user === null || user === void 0 ? void 0 : user.sportyProfile) {
        res.json({
            message: "sporty profile",
            data: user === null || user === void 0 ? void 0 : user.sportyProfile,
        });
    }
    else {
        res.json({
            message: "No sporty profile added for this user",
        });
    }
}));
router.post("/sportyprofile", (0, validation_middleware_1.validateRequest)(sporty_1.SportyProfile), auth_middleware_1.verifySession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const data = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        include: {
            sportyProfile: true,
        },
    });
    if (user === null || user === void 0 ? void 0 : user.sportyProfile) {
        yield prisma_1.default.sportyProfile.update({
            where: {
                id: user.sportyProfile.id,
            },
            data: {
                phone: data.phone,
                password: data.password,
            },
        });
    }
    else {
        let profile = yield prisma_1.default.sportyProfile.create({
            data: {
                user: {
                    connect: {
                        id: user === null || user === void 0 ? void 0 : user.id,
                    },
                },
                phone: data.phone,
                password: data.password,
            },
        });
    }
    res.json({
        message: "Sporty Profile updated successfully",
    });
}));
router.get("/pay", (0, validation_middleware_1.validateRequest)(payment_1.PaySchema), auth_middleware_1.verifySession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const { plan } = req.body;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        select: {
            email: true,
            firstname: true,
            lastname: true,
        },
    });
    const paymentResponse = yield (0, payment_2.default)(email, plan);
    res.json({
        message: "Payment initiated",
        data: {
            url: paymentResponse.data.authorization_url,
        },
    });
}));
router.get("/", auth_middleware_1.verifySession, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = res.locals.email;
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
        select: {
            email: true,
            firstname: true,
            lastname: true,
        },
    });
    res.json(user);
}));
exports.default = router;

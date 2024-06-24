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
exports.default = initiatePaystackPayment;
const axios_1 = __importDefault(require("axios"));
const PAYMENT_PLANS = {
    BASIC_NORMAL: { code: "PLN_xk7biqljij98mz3", amount: 15000 },
    CUSTOMIZED_NORMAL: { code: "PLN_xeayfpqgb59rb9a", amount: 25000 },
    BASIC_PRIME: { code: "PLN_ryeke7ub2mm4bnh", amount: 30000 },
    CUSTOMIZED_PRIME: { code: "PLN_wcjmc0mbjn05kcg", amount: 50000 },
};
function initiatePaystackPayment(email, plan) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code, amount } = PAYMENT_PLANS[plan];
        const response = yield axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email: email,
            currency: "NGN",
            amount: amount,
            plan: "PLN_enptoum7q4uz8kg",
            metadata: {
                plan: plan,
            },
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        return response.data;
    });
}

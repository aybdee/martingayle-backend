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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_io_1 = require("socket.io");
const error_middleware_1 = require("./middleware/error.middleware");
const bot_1 = __importDefault(require("./routes/bot"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const PORT = 4000;
dotenv_1.default.config();
const initServer = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json());
    //add routers
    app.use("/auth", auth_1.default);
    app.use("/user", user_1.default);
    app.use("/webhook", webhook_1.default);
    app.use("/bot", (0, bot_1.default)(io));
    app.use(error_middleware_1.errorHandler);
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});
initServer();

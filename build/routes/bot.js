"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bot_1 = require("../types/bot");
const router = (0, express_1.Router)();
let clientCount = 0;
const clients = {};
const getAvailableClient = () => {
    for (const clientId in clients) {
        if (clients[clientId].state === bot_1.ClientState.INACTIVE) {
            return parseInt(clientId, 10);
        }
    }
    return null;
};
exports.default = (io) => {
    io.on("connection", (socket) => {
        clientCount += 1;
        console.log(`device ${clientCount} connected`);
        clients[clientCount] = {
            id: clientCount,
            state: bot_1.ClientState.INACTIVE,
            currentBetAmount: "",
        };
        socket.emit("acknowledge", { id: clientCount });
        socket.on("current_amount", (data) => {
            console.log(`current bet ${data}`);
            const { id, amount } = data;
            if (clients[id]) {
                clients[id].currentBetAmount = amount;
            }
        });
    });
    router.get("/", (req, res) => {
        res.send("Bot Home");
    });
    router.post("/stop_betting/:clientId", (req, res) => {
        const clientId = parseInt(req.params.clientId, 10);
        if (!clientId) {
            return res.status(400).json({ error: "Client ID is missing" });
        }
        const client = clients[clientId];
        if (client) {
            io.emit("stop_betting", { id: clientId });
            clients[clientId].state = bot_1.ClientState.INACTIVE;
            clients[clientId].currentBetAmount = "";
            return res.status(200).json({ message: "Betting stopped" });
        }
        else {
            return res.status(404).json({ error: "Client not found" });
        }
    });
    router.get("/get_current_amount/:clientId", (req, res) => {
        const clientId = parseInt(req.params.clientId, 10);
        const client = clients[clientId];
        if (client) {
            return res.status(200).json({ message: client.currentBetAmount });
        }
        return res.status(404).json({ error: "Client not found" });
    });
    router.post("/start_betting", (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Username or password is missing in the JSON data" });
        }
        const availableClient = getAvailableClient();
        if (availableClient !== null) {
            io.emit("start_betting", {
                id: availableClient.toString(),
                username,
                password,
            });
            clients[availableClient].state = bot_1.ClientState.ACTIVE;
            return res.status(200).json({ client_id: availableClient });
        }
        else {
            return res.status(400).json({ error: "No available client" });
        }
    });
    return router;
};

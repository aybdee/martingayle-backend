import express from "express";
import http from "http";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import logsRouter from "./routes/logs";
import webhookRouter from "./routes/webhook";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { errorHandler } from "./middleware/error.middleware";
import botRouter from "./routes/bot";

import cors from "cors";
import dotenv from "dotenv";

const PORT = 4000;
dotenv.config();

const initServer = async () => {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  app.use(cors());
  app.use(bodyParser.json());
  //add routers
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/webhook", webhookRouter);
  app.use("/bot", botRouter(io));
  app.use("/logs", logsRouter);

  app.use(errorHandler);

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
};

initServer();

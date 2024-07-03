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
import { spinDownWorkers } from "./utils/render";
import { deleteAllBotSessions } from "./utils/prisma";
import { pollQueueUpdates } from "./utils/bot";
import { client } from "./utils/redis";

const PORT = process.env.PORT ?? 4000;
dotenv.config();

const initServer = async () => {
  const app = express();
  client.connect();

  app.use(cors());
  app.use(bodyParser.json());
  //add routers
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/webhook", webhookRouter);
  app.use("/bot", botRouter);
  app.use("/logs", logsRouter);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  await pollQueueUpdates();
};

initServer();

import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import {
  verifySession,
  verifyAdminSession,
} from "../middleware/auth.middleware";
import prisma from "../utils/prisma";
import { z } from "zod";
import { $Enums } from "@prisma/client";
import { stopBotSession } from "../utils/bot";

let router = Router();

router.get(
  "/admin/users",
  verifySession,
  verifyAdminSession,
  async (req, res) => {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        currentPlan: true,
      },
    });
    res.json(users);
  },
);

router.get(
  "/admin/bots/",
  verifySession,
  verifyAdminSession,
  async (req, res) => {
    const botSessions = await prisma.botSession.findMany({});
    res.json(botSessions);
  },
);

router.post(
  "/admin/bot/stop/:phone",
  verifySession,
  verifyAdminSession,
  async (req, res) => {
    const phone = req.params.phone;
    const user = await prisma.user.findFirst({
      where: {
        botSession: {
          phone: phone,
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "bot not running" });
    } else {
      let result = await stopBotSession(user.email);
      if (result) {
        return res.status(200).json({ message: "bot stopped" });
      } else {
        return res.status(400).json({ message: "bot not running" });
      }
    }
  },
);

router.post(
  "/admin/stats",
  verifySession,
  verifyAdminSession,

  async (req, res) => {
    const botSessions = await prisma.botSession.findMany({});
    const users = await prisma.user.findMany({});

    const moneyInCirculation = botSessions
      .map((botSession) => botSession.currentAmount)
      .reduce((acc, currentAmount) => {
        return acc + currentAmount;
      });

    const totalProfit = botSessions
      .map((botSession) => botSession.currentAmount - botSession.initialAmount)
      .reduce((acc, currentAmount) => {
        return acc + currentAmount;
      });

    res.json({
      moneyInCirculation,
      totalProfit,
      totalUsers: users.length,
      currentBotSessions: botSessions.length,
    });
  },
);

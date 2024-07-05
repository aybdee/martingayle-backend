import { Router, Request, Response } from "express";
import { Server } from "socket.io";
import { Client, ClientState } from "../types/bot";
import { verifySession } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { validateSubscription } from "../utils/subscription";
import { StartBotSchema } from "../schemas/bot";
import prisma from "../utils/prisma";
import { z } from "zod";
import { Subscription } from "../types/api";
import { client } from "../utils/redis";
import { calculateStats } from "../utils/stats";
import { $Enums } from "@prisma/client";
const router = Router();

router.post("/stop", verifySession, async (req: Request, res: Response) => {
  const email = res.locals.email;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      botSession: true,
      StatsProfile: true,
    },
  });

  const session = user?.botSession;

  if (session) {
    await client.lPush(
      "stop_queue",
      JSON.stringify({
        username: session.phone,
      })
    );

    if (user.StatsProfile) {
      let stats = calculateStats(user, user.StatsProfile, session);
      let transactions: {
        amount: number;
        type: $Enums.TransactionType;
        status: $Enums.TransactionStatus;
      }[] = [
        {
          amount: Math.max(session.currentAmount - session.initialAmount, 0),
          type: $Enums.TransactionType.BOT_SESION,
          status: "VERIFIED",
        },
      ];

      if (
        !validateSubscription(
          ["CUSTOMIZED_PRIME", "BASIC_PRIME"],
          user.currentPlan
        )
      ) {
        transactions.push({
          amount: (session.currentAmount - session.initialAmount) * 0.1,
          type: $Enums.TransactionType.BOT_SESSION_PAYMENT,
          status: "PENDING",
        });
      }
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          StatsProfile: {
            update: {
              pendingSplit: stats.pendingSplit,
              dailyProfit: stats.dailyProfit,
            },
          },

          TransactionLogs: {
            create: transactions,
          },
        },
      });
    }

    await prisma.botSession.delete({
      where: {
        phone: session.phone,
      },
    });
    return res.status(200).json({ message: "bot stopped" });
  } else {
    return res.status(404).json({ message: "User has no running bot session" });
  }
});

router.get("/amount", verifySession, async (req: Request, res: Response) => {
  const email = res.locals.email;
  const session = await prisma.botSession.findFirst({
    where: {
      user: {
        email: email,
      },
    },
  });
  if (session) {
    return res.status(200).json({
      message: "current amount",
      data: {
        amount: session.currentAmount,
        profit: session.currentAmount - session.initialAmount,
      },
    });
  }
  return res.status(404).json({ message: "User has no running bet session" });
});

router.post("/start", verifySession, async (req: Request, res: Response) => {
  const email = res.locals.email;
  const config = req.body as z.infer<typeof StartBotSchema>;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },

    include: {
      sportyProfile: true,
      botSession: true,
    },
  });

  if (user?.botSession) {
    return res
      .status(400)
      .json({ message: "User already has a running bot session" });
  }

  if (!user?.sportyProfile) {
    return res
      .status(400)
      .json({ error: "user does not have a sporty profile" });
  } else {
    if (config.max_loss || config.lot_size) {
      const validSubscriptions = [
        "CUSTOMIZED_PRIME",
        "CUSTOMIZED_NORMAL",
      ] as Subscription[];
      if (!validateSubscription(validSubscriptions, user.currentPlan)) {
        return res.status(403).json({ error: `Subscription required` });
      }
    } else {
      const validSubscriptions = "ALL";
      if (!validateSubscription(validSubscriptions, user.currentPlan)) {
        return res.status(403).json({ error: `Subscription required` });
      }
    }
    await client.lPush(
      "bet_queue",
      JSON.stringify({
        username: user.sportyProfile.phone,
        password: user.sportyProfile.password,
        max_loss: config.max_loss,
        lot_size: config.lot_size,
      })
    );

    await prisma.botSession.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        phone: user.sportyProfile.phone,
        initialAmount: 0,
        currentAmount: 0,
      },
    });

    return res.status(200).json({ message: "started bot" });
  }
});

export default router;

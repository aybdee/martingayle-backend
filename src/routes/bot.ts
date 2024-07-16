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
import { stopBotSession } from "../utils/bot";
const router = Router();

router.post(
  "/scan/start",
  verifySession,
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user?.currentPlan == $Enums.PaymentPlan.AUTOMATED_PRIME) {
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          isScanning: true,
        },
      });
      return res.status(200).json({ message: "scan started" });
    } else {
      return res
        .status(400)
        .json({ message: "Automated prime subscription required" });
    }
  },
);

router.get(
  "/scan/status",
  verifySession,
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user?.currentPlan == $Enums.PaymentPlan.AUTOMATED_PRIME) {
      return res.status(200).json({ isScanning: user.isScanning });
    } else {
      return res
        .status(400)
        .json({ message: "Automated prime subscription required" });
    }
  },
);

router.post(
  "/scan/stop",
  verifySession,
  async (req: Request, res: Response) => {
    const email = res.locals.email;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user?.currentPlan == $Enums.PaymentPlan.AUTOMATED_PRIME) {
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          isScanning: false,
        },
      });
      return res.status(200).json({ message: "scan stopped" });
    } else {
      return res
        .status(400)
        .json({ message: "Automated prime subscription required" });
    }
  },
);

router.post("/stop", verifySession, async (req: Request, res: Response) => {
  const email = res.locals.email;
  let result = await stopBotSession(email);
  if (result) {
    return res.status(200).json({ message: "bot stopped" });
  } else {
    return res.status(400).json({ message: "bot not running" });
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
  console.log(config);

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
    if (config.max_risk || config.lot_size) {
      const validSubscriptions = [
        "CUSTOMIZED_PRIME",
        "CUSTOMIZED_NORMAL",
      ] as Subscription[];
      if (!validateSubscription(validSubscriptions, user.currentPlan)) {
        config.max_risk = 16000;
        config.lot_size = 10;
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
        max_risk: config.max_risk,
        lot_size: config.lot_size,
      }),
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

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
const router = Router();

router.post("/stop", verifySession, async (req: Request, res: Response) => {
  const email = res.locals.email;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      botSession: true,
    },
  });

  const session = user?.botSession;

  if (session) {
    await client.lPush(
      "bet_queue",
      JSON.stringify({
        command: "stop",
        username: session.phone,
      })
    );

    // await prisma.user.update({
    //   where: {
    //     email: email,
    //   },
    //   data: {
    //     StatsProfile:{
    //       update:

    //     }
    //   },
    // });

    await prisma.botSession.delete({
      where: {
        phone: session.phone,
      },
    });
    return res.status(200).json({ message: "bot stopped" });
  } else {
    return res.status(404).json({ error: "User has no running bot session" });
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
  return res.status(404).json({ error: "User has no running bet session" });
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
    },
  });

  if (!user?.sportyProfile) {
    return res
      .status(400)
      .json({ error: "user does not have a sporty profile" });
  } else {
    if (config.max_loss || config.risk) {
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
        command: "start",
        username: user.sportyProfile.phone,
        password: user.sportyProfile.password,
        max_loss: config.max_loss,
        risk: config.risk,
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

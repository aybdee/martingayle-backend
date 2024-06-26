import { Router, Request, Response } from "express";
import { Server } from "socket.io";
import { Client, ClientState } from "../types/bot";
import { verifySession } from "../middleware/auth.middleware";
import { validateSubscription } from "../middleware/subscription.middleware";
import prisma from "../utils/prisma";

const router = Router();

async function getAvailableClient() {
  let availableClient = await prisma.botSession.findFirst({
    where: {
      state: "INACTIVE",
    },
  });
  if (availableClient) {
    return availableClient;
  } else {
    return null;
  }
}

export default (io: Server) => {
  io.on("connection", async (socket) => {
    const ip = socket.handshake.address;
    const existingBot = await prisma.botSession.findUnique({
      where: {
        id: ip,
      },
    });

    if (existingBot) {
      await prisma.botSession.update({
        where: {
          id: ip,
        },
        data: {
          state: "INACTIVE",
        },
      });
    } else {
      const newBotSession = await prisma.botSession.create({
        data: {
          state: "INACTIVE",
          id: ip,
        },
      });
      console.log(`device ${newBotSession.id} connected`);
    }

    socket.emit("acknowledge", { id: ip });

    socket.on("current_amount", async (data) => {
      const { id, amount } = data;
      const botSession = await prisma.botSession.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
        },
      });

      if (botSession) {
        let safeAmount = parseFloat(amount.replace(" ", "").replace(",", ""));
        if (safeAmount) {
          await prisma.botSession.update({
            where: {
              id: id,
            },
            data: {
              currentAmount: safeAmount,
            },
          });

          await prisma.betLogs.create({
            data: {
              betAmount: safeAmount,
              user: {
                connect: {
                  id: botSession.user!.id,
                },
              },
            },
          });
        }
      }
    });
  });

  router.post("/stop", verifySession, async (req: Request, res: Response) => {
    const email = res.locals.email;
    const client = await prisma.botSession.findFirst({
      where: {
        user: {
          email: email,
        },
      },
    });
    if (client) {
      io.emit("stop_betting", { id: client.id });
      await prisma.botSession.update({
        where: {
          id: client.id,
        },
        data: {
          state: "INACTIVE",
          currentAmount: 0,
        },
      });
      return res.status(200).json({ message: "bot stopped" });
    } else {
      return res.status(404).json({ error: "Client not found" });
    }
  });

  router.get("/amount", verifySession, async (req: Request, res: Response) => {
    const email = res.locals.email;
    const client = await prisma.botSession.findFirst({
      where: {
        user: {
          email: email,
        },
      },
    });
    if (client) {
      return res.status(200).json({
        message: "current amount",
        data: { amount: client.currentAmount },
      });
    }
    return res.status(404).json({ error: "User has no running bet session" });
  });

  router.post(
    "/start",
    verifySession,
    validateSubscription("BASIC_NORMAL"),
    async (req: Request, res: Response) => {
      const email = res.locals.email;

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
        const availableClient = await getAvailableClient();
        if (availableClient !== null) {
          io.emit("start_betting", {
            id: availableClient.id,
            username: user.sportyProfile.phone,
            password: user.sportyProfile.password,
          });

          await prisma.botSession.update({
            where: {
              id: availableClient.id,
            },
            data: {
              state: "ACTIVE",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          return res.status(200).json({ message: "started bot" });
        } else {
          return res
            .status(400)
            .json({ error: "No Clients currently available" });
        }
      }
    }
  );

  router.post(
    "/start/:max_loss",
    verifySession,
    validateSubscription("CUSTOMIZED_NORMAL"),
    async (req: Request, res: Response) => {
      const email = res.locals.email;

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
        const availableClient = await getAvailableClient();
        if (availableClient !== null) {
          io.emit("start_betting", {
            id: availableClient.id,
            username: user.sportyProfile.phone,
            password: user.sportyProfile.password,
            config: {
              max_loss: parseInt(req.params.max_loss),
            },
          });

          await prisma.botSession.update({
            where: {
              id: availableClient.id,
            },
            data: {
              state: "ACTIVE",
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          return res.status(200).json({ message: "started bot" });
        } else {
          return res
            .status(400)
            .json({ error: "No Clients currently available" });
        }
      }
    }
  );

  return router;
};

import prisma from "../utils/prisma";
import { commandOptions } from "redis";
import { createClient } from "redis";

const REDIS_URL = process.env.REDISCLOUD_URL;

const logClient = createClient({
  url: REDIS_URL,
});

//have two clients since they're blocking
const updateClient = createClient({
  url: REDIS_URL,
});

export async function pollLogUpdates() {
  console.log("polling log updates");
  await logClient.connect();
  while (true) {
    const log = await logClient.blPop(
      commandOptions({ isolated: true }),
      "log_queue",
      0,
    );

    if (log) {
      await prisma.analysisLogs.create({
        data: {
          coinFace: log.element,
        },
      });
    }
  }
}

export async function pollQueueUpdates() {
  console.log("polling queue updates");
  await updateClient.connect();
  while (true) {
    const update = await updateClient.blPop(
      commandOptions({ isolated: true }),
      "update_queue",
      0,
    );
    if (update) {
      const data = JSON.parse(update.element);

      const user = await prisma.user.findFirst({
        where: {
          sportyProfile: {
            phone: data.username,
          },
        },
      });

      if (user) {
        await prisma.betLogs.create({
          data: {
            betAmount: data.amount,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        try {
          const session = await prisma.botSession.findUnique({
            where: {
              phone: data.username,
            },
          });
          if (session?.initialAmount == 0) {
            await prisma.botSession.update({
              where: {
                phone: data.username,
              },
              data: {
                initialAmount: data.amount,
                currentAmount: data.amount,
              },
            });
          } else {
            await prisma.botSession.update({
              where: {
                phone: data.username,
              },
              data: {
                currentAmount: data.amount,
              },
            });
          }
        } catch (e) {
          console.log("dropped update for user", data.username);
        }
      }
    }
  }
}

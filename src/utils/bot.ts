import prisma from "../utils/prisma";
import { commandOptions } from "redis";
import { createClient } from "redis";

const REDIS_URL = process.env.REDISCLOUD_URL;

const client = createClient({
  url: REDIS_URL,
});

export async function pollQueueUpdates() {
  console.log("polling queue updates");
  await client.connect();
  while (true) {
    const update = await client.blPop(
      commandOptions({ isolated: true }),
      "update_queue",
      0
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

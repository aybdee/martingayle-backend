import prisma from "../utils/prisma";
import { commandOptions } from "redis";
import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

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

        const session = await prisma.botSession.findUnique({
          where: {
            phone: data.phone,
          },
        });

        if (session?.initialAmount == 0) {
          await prisma.botSession.update({
            where: {
              phone: data.phone,
            },
            data: {
              initialAmount: data.amount,
              currentAmount: data.amount,
            },
          });
        } else {
          await prisma.botSession.update({
            where: {
              phone: data.phone,
            },
            data: {
              currentAmount: data.amount,
            },
          });
        }
      }
    }
  }
}

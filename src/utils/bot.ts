import { User } from "@prisma/client";
import prisma from "../utils/prisma";
import { commandOptions } from "redis";
import { createClient } from "redis";
import { client } from "../utils/redis";
import { calculateStats } from "./stats";
import { $Enums } from "@prisma/client";
import { StartBotSchema } from "../schemas/bot";
import { validateSubscription } from "./subscription";
import { z } from "zod";
import { Subscription } from "../types/api";
import {
  BET,
  bet_records,
  drawDownOccured,
  drawDownProcessing,
  resetDrawDownProcessing,
  setDrawDownProcessing,
} from "./records";
import { WASI } from "wasi";

const REDIS_URL = process.env.REDISCLOUD_URL;

const logClient = createClient({
  url: REDIS_URL,
});

//have two clients since they're blocking
const updateClient = createClient({
  url: REDIS_URL,
});

export async function batchBotStopAutomaticSession() {
  const runningSessions = await prisma.botSession.findMany({
    where: {
      user: {
        currentPlan: $Enums.PaymentPlan.AUTOMATED_PRIME,
      },
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  console.log(`stopping session for ${runningSessions.length} users`);
  resetDrawDownProcessing();

  await Promise.all(
    runningSessions.map((session) => {
      return stopBotSession(session.user?.email!);
    }),
  );
}

export async function batchBotStartAutomaticSession() {
  const users = await prisma.user.findMany({
    where: {
      currentPlan: $Enums.PaymentPlan.AUTOMATED_PRIME,
      isScanning: true,
    },
    select: {
      email: true,
    },
  });

  console.log(`starting session for ${users.length} users`);

  await Promise.all(
    users.map((user) => {
      return startBotSession(user.email, {
        max_risk: 16000,
        lot_size: 100,
      });
    }),
  );
}

export async function startBotSession(
  email: string,
  config: z.infer<typeof StartBotSchema>,
) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      botSession: true,
      sportyProfile: true,
    },
  });

  if (!user || !user.sportyProfile || user.botSession) {
    return false;
  } else {
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
  }
}

export async function stopBotSession(email: string) {
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
      }),
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
          user.currentPlan as Subscription,
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
    return true;
  } else {
    return false;
  }
}

export async function pollLogUpdates() {
  console.log("polling log updates");
  await logClient.connect();
  const pollLogs = async () => {
    const log = await logClient.blPop(
      commandOptions({ isolated: true }),
      "log_queue",
      0,
    );

    if (log) {
      let bet = log.element as BET;
      console.log(bet);
      bet_records.push(bet);
      await prisma.analysisLogs.create({
        data: {
          coinFace: bet,
        },
      });
    }
  };
  setInterval(pollLogs, 1000); // Poll every second
}

export async function pollQueueUpdates() {
  console.log("polling queue updates");
  await updateClient.connect();

  const pollQueue = async () => {
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

          if (session?.initialAmount === 0) {
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
  };

  setInterval(pollQueue, 1000); // Poll every second
}

export async function pollDrawDowns(
  numConsecutive: number,
  numRunningHours: number,
) {
  console.log(`polling for drawdowns of ${numConsecutive} bets`);

  const pollDraws = async () => {
    if (drawDownOccured(numConsecutive) && drawDownProcessing === false) {
      await batchBotStopAutomaticSession();
      setDrawDownProcessing();
      console.log(`drawdown of ${numConsecutive} bets occurred`);
      await batchBotStartAutomaticSession();
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * 60 * 60 * numRunningHours),
      );
      await batchBotStopAutomaticSession();
    }
  };
  setInterval(pollDraws, 1000); // Check for drawdowns every second
}

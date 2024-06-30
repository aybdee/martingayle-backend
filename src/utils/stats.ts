import { BotSession, StatsProfile, User } from "@prisma/client";

export function calculateStats(user: User, session: BotSession) {
  const profit = session.currentAmount - session.initialAmount;
  //   const lastProfitDate = user.
  //   let stats: StatsProfile = {
  //     pendingSplit: profit > 0 ? profit * 0.3 : 0,
  //     dailyProfit: profit,
  //   };
}

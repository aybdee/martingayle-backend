import { BotSession, StatsProfile, User } from "@prisma/client";
import { validateSubscription } from "./subscription";

export function calculateStats(
  user: User,
  stats: StatsProfile,
  session: BotSession
) {
  const profit = session.currentAmount - session.initialAmount;
  const lastUpdate = stats.updatedAt;
  let isSameDay = false;
  let userMustSplit = validateSubscription(
    ["BASIC_PRIME", "CUSTOMIZED_PRIME"],
    user.currentPlan
  );

  if (lastUpdate) {
    isSameDay = new Date(lastUpdate).getDate() === new Date().getDate();
  }
  return {
    pendingSplit: userMustSplit ? (profit > 0 ? profit * 0.3 : 0) : 0,
    dailyProfit: isSameDay ? stats.dailyProfit + profit : profit,
  };
}

export function calculateReferralEarnings(user: User, referrals: User[]) {
  let upgradedReferral = validateSubscription(
    ["BASIC_PRIME", "CUSTOMIZED_PRIME"],
    user.currentPlan
  );
}

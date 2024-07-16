import { BotSession, StatsProfile, User } from "@prisma/client";
import { validateSubscription } from "./subscription";

export function calculateStats(
  user: User,
  stats: StatsProfile,
  session: BotSession,
) {
  const profit = session.currentAmount - session.initialAmount;
  const lastUpdate = stats.updatedAt;
  let isSameDay = false;
  let userMustSplit = !validateSubscription(
    ["BASIC_PRIME", "CUSTOMIZED_PRIME"],
    user.currentPlan,
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
    user.currentPlan,
  );

  const SubPriceMap = {
    FREE: 0,
    BASIC_NORMAL: 15000,
    CUSTOMIZED_NORMAL: 30000,
    BASIC_PRIME: 25000,
    CUSTOMIZED_PRIME: 50000,
    AUTOMATED_PRIME: 50000,
  };

  return referrals.reduce((acc, referral) => {
    let price = SubPriceMap[referral.currentPlan];
    return acc + price * 0.1;
  }, 0);
}

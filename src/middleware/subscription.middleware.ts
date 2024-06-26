import { RequestHandler } from "express";
import { Subscription } from "../types/api";
import prisma from "../utils/prisma";

let subscriptionrank = {
  FREE: 0,
  BASIC_NORMAL: 1,
  CUSTOMIZED_NORMAL: 2,
  BASIC_PRIME: 3,
  CUSTOMIZED_PRIME: 4,
};

export function validateSubscription(
  subscription: Subscription
): RequestHandler {
  return async (req, res, next) => {
    let email = res.locals.email;
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    let planRank = subscriptionrank[subscription];
    console.log(user?.currentPlan);
    if (planRank > subscriptionrank[user?.currentPlan!]) {
      return res
        .status(403)
        .json({ error: `${subscription} Subscription required` });
    } else {
      next();
    }
  };
}

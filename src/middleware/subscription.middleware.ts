import { RequestHandler } from "express";
import { Subscription } from "../types/api";
import prisma from "../utils/prisma";
import { $Enums } from "@prisma/client";

export function validateSubscriptionMiddleware(
  validSubscriptions: $Enums.PaymentPlan[]
): RequestHandler {
  return async (req, res, next) => {
    let email = res.locals.email;
    let user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log(user?.currentPlan);
    if (validSubscriptions.includes(user?.currentPlan!)) {
      return res.status(403).json({ error: `Subscription required` });
    } else {
      next();
    }
  };
}

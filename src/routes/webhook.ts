import { Router } from "express";
import "express-async-errors";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { calculateReferralEarnings } from "../utils/stats";
let router = Router();

router.post("/", async (req, res) => {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const eventData = req.body;
    console.log(eventData);

    if (eventData.event == "charge.success") {
      let email = eventData.data.customer.email;
      let plan = eventData.data.plan.name;
      //send acknowledge before performing any operations to avoid multiple requests
      res.sendStatus(200);
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          currentPlan: plan,
        },
      });

      let referredBy = await prisma.user.findFirst({
        where: {
          referrals: {
            some: {
              email: email,
            },
          },
        },
        include: {
          referrals: true,
        },
      });

      if (referredBy) {
        await prisma.user.update({
          where: {
            id: referredBy.id,
          },
          data: {
            StatsProfile: {
              update: {
                referralEarnings: calculateReferralEarnings(referredBy, [
                  ...referredBy.referrals,
                ]),
              },
            },
          },
        });
      }
      // Create a new worker instance
    } else if (eventData.event == "subscription.disable") {
      let email = eventData.data.customer.email;
      res.sendStatus(200);
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          currentPlan: "FREE",
        },
      });

      let referredBy = await prisma.user.findFirst({
        where: {
          referrals: {
            some: {
              email: email,
            },
          },
        },
        include: {
          referrals: true,
        },
      });

      if (referredBy) {
        await prisma.user.update({
          where: {
            id: referredBy.id,
          },
          data: {
            StatsProfile: {
              update: {
                referralEarnings: calculateReferralEarnings(referredBy, [
                  ...referredBy.referrals,
                ]),
              },
            },
          },
        });
      }
    } else {
      res.sendStatus(200);
    }
  }
});

export default router;

import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import { verifySession } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";
import { PaySchema } from "../schemas/payment";
import { z } from "zod";
import { SportyProfile } from "../schemas/sporty";
import { initiatePaystackPayment } from "../utils/payment";
const router = Router();

router.get("/", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      StatsProfile: true,
      sportyProfile: true,
    },
  });

  let stats = user?.StatsProfile;

  if (!stats) {
    let newProfile = await prisma.statsProfile.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    stats = newProfile;
  } else {
    res.json({
      message: "stats",
      data: {
        username: user?.username,
        plan: user?.currentPlan,
        email: user?.email,
        status: user?.accountStatus,
        pendingPayment: user?.pendingPayment,
        paymentDeadline: user?.pendingExpiry ?? "NONE",
        sportyProfile: user?.sportyProfile
          ? {
              phone: user?.sportyProfile?.phone,
              password: user?.sportyProfile?.password,
            }
          : {},
        stats: {
          dailyProfit: Math.max(stats.dailyProfit, 0),
          pendingSplit: Math.max(stats.pendingSplit, 0),
          referralEarnings: stats.referralEarnings,
        },
      },
    });
  }
});

router.get("/referrals", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      referrals: true,
    },
  });

  if (!user?.referrals) {
    res.json({
      message: "No referrals",
    });
  }
  res.json({
    message: "Referrals",
    data: user?.referrals.map((referral) => {
      return {
        email: referral.email,
        firstname: referral.firstname,
        lastname: referral.lastname,
        plan: referral.currentPlan,
        joinDate: referral.createdAt,
      };
    }),
  });
});

router.get("/sportyprofile/", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      sportyProfile: {
        select: {
          phone: true,
          password: true,
        },
      },
    },
  });

  if (user?.sportyProfile) {
    res.json({
      message: "sporty profile",
      data: user?.sportyProfile,
    });
  } else {
    res.json({
      message: "No sporty profile added for this user",
    });
  }
});

router.post(
  "/sportyprofile",
  validateRequest(SportyProfile),
  verifySession,
  async (req, res) => {
    const email = res.locals.email;
    const data = req.body as z.infer<typeof SportyProfile>;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        sportyProfile: true,
      },
    });

    if (user?.sportyProfile) {
      await prisma.sportyProfile.update({
        where: {
          id: user.sportyProfile.id,
        },
        data: {
          phone: data.phone,
          password: data.password,
        },
      });
    } else {
      let profile = await prisma.sportyProfile.create({
        data: {
          user: {
            connect: {
              id: user?.id,
            },
          },
          phone: data.phone,
          password: data.password,
        },
      });
    }

    res.json({
      message: "Sporty Profile updated successfully",
    });
  }
);

router.post(
  "/pay",
  validateRequest(PaySchema),
  verifySession,
  async (req, res) => {
    const email = res.locals.email;
    const { plan } = req.body as z.infer<typeof PaySchema>;

    const paymentResponse = await initiatePaystackPayment(email, plan);

    res.json({
      message: "Payment initiated",
      data: {
        url: paymentResponse.data.authorization_url,
      },
    });
  }
);

export default router;

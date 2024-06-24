import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import { verifySession } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";
import { PaySchema } from "../schemas/payment";
import { z } from "zod";
import { SportyProfile } from "../schemas/sporty";
import initiatePaystackPayment from "../utils/payment";

const router = Router();

router.get("/stats", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      StatsProfile: true,
    },
  });

  if (!user?.StatsProfile) {
    let newProfile = await prisma.statsProfile.create({
      data: {
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });

    res.json({
      message: "stats",
      data: {
        plan: user?.currentPlan,
        status: user?.accountStatus,
        pendingPayment: user?.pendingPayment,
        paymentDeadline: user?.pendingExpiry ?? "NONE",
        stats: {
          dailyProfit: newProfile.dailyProfit,
          pendingSplit: newProfile.pendingSplit,
          pendingWithdraw: newProfile.pendingWithdraw,
          referralEarnings: newProfile.referralEarnings,
        },
      },
    });
  } else {
    res.json({
      message: "stats",
      data: {
        plan: user?.currentPlan,

        status: user?.accountStatus,
        pendingPayment: user?.pendingPayment,
        paymentDeadline: user?.pendingExpiry ?? "NONE",
        stats: {
          dailyProfit: user.StatsProfile.dailyProfit,
          pendingSplit: user.StatsProfile.pendingSplit,
          pendingWithdraw: user.StatsProfile.pendingWithdraw,
          referralEarnings: user.StatsProfile.referralEarnings,
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

router.get("/pay/verify", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user?.attemptUpgradePlan == user?.currentPlan) {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        currentPlan: user?.attemptUpgradePlan,
        attemptUpgradePlan: null,
      },
    });

    res.json({
      message: "VERIFIED",
    });
  } else {
    if (user?.attemptUpgradePlan) {
      res.json({
        message: "PENDING",
      });
    } else {
      res.json({
        message: "NONE_PENDING",
      });
    }
  }
});

router.get(
  "/pay",
  validateRequest(PaySchema),
  verifySession,
  async (req, res) => {
    const email = res.locals.email;
    const { plan } = req.body as z.infer<typeof PaySchema>;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },

      select: {
        email: true,
        firstname: true,
        lastname: true,
      },
    });

    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        attemptUpgradePlan: plan,
      },
    });

    const paymentResponse = await initiatePaystackPayment(email, plan);

    res.json({
      message: "Payment initiated",
      data: {
        url: paymentResponse.data.authorization_url,
      },
    });
  }
);

router.get("/", verifySession, async (req, res) => {
  const email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },

    select: {
      email: true,
      firstname: true,
      lastname: true,
    },
  });
  res.json(user);
});

export default router;

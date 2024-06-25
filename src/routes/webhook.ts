import { Router } from "express";
import "express-async-errors";
import crypto from "crypto";
import prisma from "../utils/prisma";
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
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          currentPlan: plan,
        },
      });

      res.sendStatus(200);
    } else if (eventData.event == "subscription.disable") {
      let email = eventData.data.customer.email;
      await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          currentPlan: "FREE",
        },
      });
      res.send(200);
    }
  }
});

export default router;

import { Router } from "express";
import "express-async-errors";
import crypto from "crypto";
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
      console.log("Payment successful");
    }
  }
});

export default router;

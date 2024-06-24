import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import { verifySession } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";
import { z } from "zod";

let router = Router();

router.get("/transactions/:logNum", verifySession, async (req, res) => {
  let email = res.locals.email;
  let logNum = req.params.logNum;
  let numLogs = 0;
  try {
    numLogs = parseInt(logNum);
  } catch (err) {
    return res.status(400).json({ error: "Invalid number of logs" });
  }

  let transactions = await prisma.transactionLogs.findMany({
    where: {
      user: {
        email: email,
      },
    },
    take: numLogs,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    message: "transaction logs",
    data: transactions.map((transaction) => {
      return {
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.createdAt,
        status: transaction.status,
      };
    }),
  });
});

router.get("/bets/:logNum", verifySession, async (req, res) => {
  let email = res.locals.email;
  let logNum = req.params.logNum;
  let numLogs = 0;
  try {
    numLogs = parseInt(logNum);
  } catch (err) {
    return res.status(400).json({ error: "Invalid number of logs" });
  }

  let bets = await prisma.betLogs.findMany({
    where: {
      user: {
        email: email,
      },
    },
    take: numLogs,
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json({
    message: "transaction logs",
    data: bets.map((bet) => {
      return {
        amount: bet.betAmount,
        date: bet.createdAt,
      };
    }),
  });
});

export default router;

import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import { verifySession } from "../middleware/auth.middleware";
import prisma from "../utils/prisma";
import { z } from "zod";
import { $Enums } from "@prisma/client";

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
  let transaction_data = transactions.map((transaction) => {
    return {
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.createdAt,
      status: transaction.status,
    };
  });

  transaction_data = [
    ...transaction_data,
    ...[
      {
        amount: 1000,
        type: $Enums.TransactionType.BOT_SESION,
        date: new Date(),
        status: $Enums.TransactionStatus.VERIFIED,
      },
      {
        amount: 1000,
        type: $Enums.TransactionType.BOT_SESSION_PAYMENT,
        date: new Date(),
        status: $Enums.TransactionStatus.PENDING,
      },
      {
        amount: 1000,
        type: $Enums.TransactionType.REFERRAL_INCOMING,
        date: new Date(),
        status: $Enums.TransactionStatus.FAILED,
      },
    ],
  ];

  res.json({
    message: "transaction logs",
    data: transaction_data,
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

  let bets_data = bets.map((bet) => {
    return {
      amount: bet.betAmount,
      date: bet.createdAt,
    };
  });
  bets_data = [
    ...bets_data,
    ...[
      {
        amount: 1000,
        date: new Date(),
      },
      {
        amount: 1000,
        date: new Date(),
      },
      {
        amount: 1000,
        date: new Date(),
      },
    ],
  ];

  res.json({
    message: "bet logs",
    data: bets_data,
  });
});

export default router;

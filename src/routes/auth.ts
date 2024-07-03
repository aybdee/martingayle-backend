import { Router } from "express";
import "express-async-errors";
import { validateRequest } from "../middleware/validation.middleware";
import { LoginSchema, SignUpSchema } from "../schemas/auth";
import bcrypt from "bcrypt";
import z from "zod";
import prisma from "../utils/prisma";
import { ApiError } from "../types/error";
import jwt from "jsonwebtoken";
import { calculateReferralEarnings } from "../utils/stats";
const router = Router();

router.post("/", validateRequest(SignUpSchema), async (req, res) => {
  let data = req.body as z.infer<typeof SignUpSchema>;
  if (await prisma.user.findUnique({ where: { email: data.email } })) {
    throw new ApiError("Email already used", 400);
  } else {
    if (await prisma.user.findUnique({ where: { username: data.username } })) {
      throw new ApiError("Username already used", 400);
    }
    let referredBy = await prisma.user.findUnique({
      where: {
        username: data.referral,
      },
    });
    if (!referredBy) {
      throw new ApiError("Referral does not exist", 400);
    } else {
      let hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          password: hashedPassword,

          referee: {
            connect: {
              id: referredBy.id,
            },
          },
        },
      });

      res.json({
        message: "User created successfully",
        data: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
        },
      });
    }
  }
});

router.post("/login", validateRequest(LoginSchema), async (req, res) => {
  let data = req.body as z.infer<typeof LoginSchema>;
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new ApiError("Email does not exist", 400);
  }
  const passwordMatch = await bcrypt.compare(data.password, user.password);
  if (!passwordMatch) {
    throw new ApiError("Incorrect Password", 400);
  }
  const token = jwt.sign(
    { email: user.email, id: user.id },
    process.env.JWT_SECRET!,
    {
      expiresIn: "10h",
    }
  );
  res.json({
    message: "Login successful",
    data: {
      token: token,
    },
  });
});
export default router;

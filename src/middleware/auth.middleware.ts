import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../types/error";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;
export const verifySession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.header("Authorization");
  if (token && token?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET) as {
        email: string;
      };
      res.locals.email = decoded.email;
      next();
    } catch (err) {
      throw new ApiError("Access Denied", 401);
    }
  } else {
    throw new ApiError("Access Denied", 401);
  }
};

export const verifyAdminSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let email = res.locals.email;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user?.role === "ADMIN") {
    next();
  } else {
    throw new ApiError("Access Denied", 401);
  }
};

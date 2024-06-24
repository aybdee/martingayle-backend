import { z } from "zod";
import { RequestHandler } from "express";
export function validateRequest(schema: z.Schema): RequestHandler {
  return (req, res, next) => {
    const validatedRequest = schema.safeParse(req.body);
    if (validatedRequest.success) {
      req.body = validatedRequest.data;
      next();
    } else {
      return res.status(400).json({
        error: validatedRequest.error.errors,
      });
    }
  };
}

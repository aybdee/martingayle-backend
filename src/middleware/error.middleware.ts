import { ErrorRequestHandler } from "express";
import { ApiError } from "../types/error";

export const errorHandler: ErrorRequestHandler = (
  err: ApiError,
  req,
  res,
  next
) => {
  res
    .status(err.statusCode ? err.statusCode : 500)
    .json({ error: err.message });
};

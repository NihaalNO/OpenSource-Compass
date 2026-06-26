import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  void next;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    error: {
      code: "internal_error",
      message: "An unexpected error occurred"
    }
  });
};

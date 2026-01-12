import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Prisma unique constraint error
  if (err.code === "P2002") {
    statusCode = 400;
    message = "Duplicate entry. This record already exists.";
  }

  // Prisma record not found error
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found.";
  }

  // Validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error occurred.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: err.isOperational ? err.message : "Internal server error",
  });
};

export default errorHandler;

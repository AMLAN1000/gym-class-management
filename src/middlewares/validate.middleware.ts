import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    throw new ApiError(400, "Validation error occurred.");
  }

  next();
};

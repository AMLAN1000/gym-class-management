import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { verifyToken } from "../utils/jwt.utils";

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access. No token provided.");
    }

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid or expired token.");
    }
  }
);

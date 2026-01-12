import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import ApiError from "../utils/ApiError";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized access.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Unauthorized access. Only ${allowedRoles.join(
          ", "
        )} can perform this action.`
      );
    }

    next();
  };
};

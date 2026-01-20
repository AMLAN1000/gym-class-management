import { Router } from "express";
import { UserController } from "./user.controller";
import { createUserValidation } from "./user.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

router.post(
  "/create",
  authenticate,
  authorize(UserRole.ADMIN),
  createUserValidation,
  validate,
  UserController.createUser,
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  UserController.getAllUsers,
);

export const UserRoutes = router;

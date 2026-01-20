/**
 * TRAINER MODULE - API ROUTES
 *
 * Defines HTTP endpoints for trainer operations
 * All routes protected - TRAINER role only
 *
 * USES: trainer.controller, trainer.validation, auth.middleware, role.middleware, validate.middleware
 * USED BY: app.ts (mounted at /api/trainers)
 */

import { Router } from "express";
import { TrainerController } from "./trainer.controller";
import { updateTrainerValidation } from "./trainer.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

// All routes require authentication and TRAINER role
router.use(authenticate, authorize(UserRole.TRAINER));

/**
 * GET /api/trainers/profile
 * Get logged-in trainer's profile
 */
router.get("/profile", TrainerController.getMyProfile);

/**
 * PUT /api/trainers/profile
 * Update logged-in trainer's profile
 */
router.put(
  "/profile",
  updateTrainerValidation,
  validate,
  TrainerController.updateMyProfile,
);

/**
 * GET /api/trainers/schedules
 * Get logged-in trainer's assigned class schedules
 */
router.get("/schedules", TrainerController.getMySchedules);

export const TrainerRoutes = router;

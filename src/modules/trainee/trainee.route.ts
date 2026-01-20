/**
 * TRAINEE MODULE - API ROUTES
 *
 * Defines HTTP endpoints for trainee operations
 * All routes protected - TRAINEE role only
 *
 * USES: trainee.controller, trainee.validation, auth.middleware, role.middleware, validate.middleware
 * USED BY: app.ts (mounted at /api/trainees)
 */

import { Router } from "express";
import { TraineeController } from "./trainee.controller";
import { updateTraineeValidation } from "./trainee.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

// All routes require authentication and TRAINEE role
router.use(authenticate, authorize(UserRole.TRAINEE));

/**
 * GET /api/trainees/profile
 * Get logged-in trainee's profile
 */
router.get("/profile", TraineeController.getMyProfile);

/**
 * PUT /api/trainees/profile
 * Update logged-in trainee's profile
 */
router.put(
  "/profile",
  updateTraineeValidation,
  validate,
  TraineeController.updateMyProfile,
);

export const TraineeRoutes = router;

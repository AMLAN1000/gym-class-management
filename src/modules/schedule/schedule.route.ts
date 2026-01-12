/**
 * SCHEDULE MODULE - API ROUTES
 *
 * Defines HTTP endpoints for schedule operations
 */

import { Router } from "express";
import { ScheduleController } from "./schedule.controller";
import {
  createScheduleValidation,
  getSchedulesValidation,
} from "./schedule.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * POST /api/schedules/create
 * Admin creates a class schedule
 *
 * BUSINESS RULES:
 * - Max 5 schedules per day
 * - Each class = 2 hours
 * - Trainer must exist
 */
router.post(
  "/create",
  authenticate,
  authorize(UserRole.ADMIN),
  createScheduleValidation,
  validate,
  ScheduleController.createSchedule
);

/**
 * GET /api/schedules
 * Get all schedules (public access for authenticated users)
 * Optional filters: ?date=2025-02-15&trainerId=xxx
 */
router.get(
  "/",
  authenticate,
  getSchedulesValidation,
  validate,
  ScheduleController.getAllSchedules
);

/**
 * GET /api/schedules/:id
 * Get schedule by ID with full details
 */
router.get("/:id", authenticate, ScheduleController.getScheduleById);

/**
 * DELETE /api/schedules/:id
 * Admin deletes a schedule
 */
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  ScheduleController.deleteSchedule
);

export const ScheduleRoutes = router;

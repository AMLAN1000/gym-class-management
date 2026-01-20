/**
 * BOOKING MODULE - API ROUTES
 *
 * Defines HTTP endpoints for booking operations
 */

import { Router } from "express";
import { BookingController } from "./booking.controller";
import { createBookingValidation } from "./booking.validation";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { UserRole } from "@prisma/client";

const router = Router();

/**
 * POST /api/bookings/book
 * Trainee books a class
 *
 * BUSINESS RULES:
 * - Max 10 trainees per schedule
 * - No time conflicts
 */
router.post(
  "/book",
  authenticate,
  authorize(UserRole.TRAINEE),
  createBookingValidation,
  validate,
  BookingController.createBooking,
);

/**
 * GET /api/bookings/my-bookings
 * Trainee views their bookings
 */
router.get(
  "/my-bookings",
  authenticate,
  authorize(UserRole.TRAINEE),
  BookingController.getMyBookings,
);

/**
 * DELETE /api/bookings/:id
 * Trainee cancels a booking
 */
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.TRAINEE),
  BookingController.cancelBooking,
);

/**
 * GET /api/bookings
 * Admin views all bookings
 */
router.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  BookingController.getAllBookings,
);

export const BookingRoutes = router;

/**
 * BOOKING MODULE - REQUEST VALIDATION
 *
 * Validates booking requests
 */

import { body } from "express-validator";

export const createBookingValidation = [
  body("scheduleId")
    .notEmpty()
    .withMessage("Schedule ID is required.")
    .isString()
    .withMessage("Schedule ID must be a valid string."),
];

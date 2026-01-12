/**
 * SCHEDULE MODULE - REQUEST VALIDATION
 *
 * Validates schedule creation and update requests
 */

import { body, query } from "express-validator";

export const createScheduleValidation = [
  body("className")
    .notEmpty()
    .withMessage("Class name is required.")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Class name must be between 3-100 characters."),

  body("date")
    .notEmpty()
    .withMessage("Date is required.")
    .isISO8601()
    .withMessage("Date must be in ISO format (YYYY-MM-DD)."),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format (e.g., 10:00)."),

  body("endTime")
    .notEmpty()
    .withMessage("End time is required.")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format (e.g., 12:00)."),

  body("trainerId")
    .notEmpty()
    .withMessage("Trainer ID is required.")
    .isString()
    .withMessage("Trainer ID must be a valid string."),
];

export const getSchedulesValidation = [
  query("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO format (YYYY-MM-DD)."),

  query("trainerId")
    .optional()
    .isString()
    .withMessage("Trainer ID must be a valid string."),
];

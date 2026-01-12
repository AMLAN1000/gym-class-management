/**
 * TRAINEE MODULE - REQUEST VALIDATION
 *
 * Express-validator rules for trainee profile updates
 * Ensures data integrity before reaching service layer
 *
 * USES: express-validator
 * USED BY: trainee.route (applied to PUT /profile)
 */

import { body } from "express-validator";

export const updateTraineeValidation = [
  body("age")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120."),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10-15 characters."),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),
];

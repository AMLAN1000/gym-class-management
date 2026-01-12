/**
 * TRAINER MODULE - REQUEST VALIDATION
 *
 * Express-validator rules for trainer profile updates
 * Ensures data integrity before reaching service layer
 *
 * USES: express-validator
 * USED BY: trainer.route (applied to PUT /profile)
 */

import { body } from "express-validator";

export const updateTrainerValidation = [
  body("specialization")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Specialization must be at least 2 characters."),
  body("experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience must be between 0 and 50 years."),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters."),
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

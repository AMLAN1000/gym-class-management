import { body } from "express-validator";

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format.").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];

export const registerValidation = [
  body("email").isEmail().withMessage("Invalid email format.").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
  body("name").notEmpty().withMessage("Name is required.").trim(),
];

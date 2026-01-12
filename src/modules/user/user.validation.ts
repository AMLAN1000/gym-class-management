import { body } from "express-validator";

export const createUserValidation = [
  body("email").isEmail().withMessage("Invalid email format."),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
  body("name").notEmpty().withMessage("Name is required."),
  body("role")
    .isIn(["TRAINER", "TRAINEE"])
    .withMessage("Role must be TRAINER or TRAINEE."),
];

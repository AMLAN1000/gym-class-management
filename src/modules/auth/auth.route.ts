import { Router } from "express";
import { AuthController } from "./auth.controller";
import { loginValidation, registerValidation } from "./auth.validation";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/login", loginValidation, validate, AuthController.login);
router.post("/register", registerValidation, validate, AuthController.register);

export const AuthRoutes = router;

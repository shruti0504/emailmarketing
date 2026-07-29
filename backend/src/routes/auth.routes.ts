import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { signupSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();
const authController = new AuthController();

router.post("/signup", validateBody(signupSchema), authController.signup);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.get("/me", authMiddleware, authController.me);

export default router;
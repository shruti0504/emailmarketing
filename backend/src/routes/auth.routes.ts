import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = Router();
const authController = new AuthController();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get(
  "/me",authMiddleware,authController.me);
export default router;
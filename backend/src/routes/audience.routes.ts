import { Router } from "express";
import { AudienceController } from "../controllers/audience.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
const audienceController = new AudienceController();

router.post(
  "/",
  authMiddleware,
  audienceController.create
);

router.get(
  "/",
  authMiddleware,
  audienceController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  audienceController.getById
);

router.delete(
  "/:id",
  authMiddleware,
  audienceController.delete
);

export default router;
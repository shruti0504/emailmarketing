import { Router } from "express";
import { AudienceController } from "../controllers/audience.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createAudienceSchema } from "../validators/audience.validator.js";

const router = Router();
const audienceController = new AudienceController();

router.post(
  "/",
  authMiddleware,
  validateBody(createAudienceSchema),
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
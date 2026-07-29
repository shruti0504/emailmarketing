import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createCampaignSchema } from "../validators/campaign.validator.js";

const router = Router();
const campaignController = new CampaignController();

router.post(
  "/",
  authMiddleware,
  validateBody(createCampaignSchema),
  campaignController.create
);

router.get(
  "/",
  authMiddleware,
  campaignController.getAll
);

router.get(
  "/:id",
  authMiddleware,
  campaignController.getById
);

router.get(
  "/:id/analytics",
  authMiddleware,
  campaignController.getAnalytics
);

router.delete(
  "/:id",
  authMiddleware,
  campaignController.delete
);

export default router;
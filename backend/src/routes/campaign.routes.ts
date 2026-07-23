import { Router } from "express";
import { CampaignController } from "../controllers/campaign.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();
const campaignController = new CampaignController();

router.post(
  "/",
  authMiddleware,
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

export default router;
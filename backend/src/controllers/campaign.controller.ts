import { Request, Response } from "express";
import { CampaignService } from "../service/campaign.service.js";
import { CampaignRepository } from "../repositories/campaign.repository.js";

const campaignService = new CampaignService();
const campaignRepository = new CampaignRepository();

export class CampaignController {
  async create(req: Request, res: Response) {
    try {
      const campaign = await campaignService.createCampaign(
        req.user.workspaceId,
        req.body
      );

      return res.status(201).json({
        success: true,
        message: "Campaign created successfully.",
        data: campaign,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const campaigns = await campaignService.getCampaigns(
        req.user.workspaceId
      );

      return res.json({
        success: true,
        data: campaigns,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const campaign = await campaignService.getCampaignById(
        id,
        req.user.workspaceId
      );

      return res.json({
        success: true,
        data: campaign,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  getAnalytics = async (req: Request, res: Response) => {
    try {
      const analytics = await campaignRepository.getAnalytics(
        req.params.id as string,
        req.user.workspaceId
      );

      return res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response) => {
    try {
      await campaignService.deleteCampaign(
        req.params.id,
        req.user.workspaceId
      );

      return res.json({
        success: true,
        message: "Campaign deleted successfully.",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };
}
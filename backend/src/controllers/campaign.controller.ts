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
        message: error.message,
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
      return res.status(500).json({
        success: false,
        message: error.message,
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
        message: error.message,
      });
    }
  }

  getAnalytics = async (
  req: Request,
  res: Response
) => {

const analytics =
  await campaignRepository.getAnalytics(
    req.params.id as string,
    req.user.workspaceId
  );

  return res.json({
    success: true,
    data: analytics,
  });

};
}
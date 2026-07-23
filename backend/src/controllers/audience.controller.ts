import { Request, Response } from "express";
import { AudienceService } from "../service/audience.service.js";

const audienceService = new AudienceService();

export class AudienceController {

  async create(req: Request, res: Response) {
    try {
      const audience = await audienceService.createAudience(
        req.user.workspaceId,
        req.body
      );

      return res.status(201).json({
        success: true,
        data: audience,
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
      const audiences = await audienceService.getAudiences(
        req.user.workspaceId
      );

      return res.json({
        success: true,
        data: audiences,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const audience = await audienceService.getAudienceById(
        id,
        req.user.workspaceId
      );

      return res.json({
        success: true,
        data: audience,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      await audienceService.deleteAudience(
        id,
        req.user.workspaceId
      );

      return res.json({
        success: true,
        message: "Audience deleted successfully.",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
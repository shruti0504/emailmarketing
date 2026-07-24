import { Request, Response } from "express";
import { WebhookRepository } from "../repositories/webhook.repository.js";

const webhookRepository = new WebhookRepository();

export class WebhookController {

  handleBrevoWebhook = async (
    req: Request,
    res: Response
  ) => {

    console.log("========== BREVO WEBHOOK ==========");
    console.log(req.body);

    await webhookRepository.create(
      "brevo",
      req.body["message-id"] ?? "",
      req.body.event ?? "",
      req.body
    );

    return res.status(200).json({
      success: true,
    });

  };
}
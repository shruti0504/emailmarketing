import { Request, Response } from "express";

export class WebhookController {

  handleBrevoWebhook = async (
    req: Request,
    res: Response
  ) => {

    console.log("========== BREVO WEBHOOK ==========");
    console.log(req.body);

    return res.status(200).json({
      success: true
    });

  };

}
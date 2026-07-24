import { Request, Response } from "express";
import { WebhookRepository } from "../repositories/webhook.repository.js";
import { CampaignRecipientRepository } from "../repositories/campaignRecipient.repository.js";

const webhookRepository = new WebhookRepository();
const recipientRepository = new CampaignRecipientRepository();
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

  // 👇 ADD THE NEW CODE HERE

  const messageId = req.body["message-id"];
  const event = req.body.event;

  const recipient =
    await recipientRepository.findByProviderMessageId(
      messageId
    );

  if (recipient) {

    let status:
      | "DELIVERED"
      | "OPENED"
      | "FAILED"
      | null = null;

    switch (event) {
      case "delivered":
        status = "DELIVERED";
        break;

      case "opened":
        status = "OPENED";
        break;

      case "hardBounce":
      case "softBounce":
      case "blocked":
        status = "FAILED";
        break;
    }

    if (status) {
      await recipientRepository.updateStatus(
        recipient.id,
        status,
        messageId
      );
    }
  }

  return res.status(200).json({
    success: true,
  });

};
}
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

    // ── 1. Log raw payload ─────────────────────────────────
    console.log("========== BREVO WEBHOOK RECEIVED ==========");
    console.log("[Webhook] Full body:", JSON.stringify(req.body, null, 2));

    const event = req.body.event ?? req.body["event"] ?? "";

    // Brevo sends the message ID in "message-id" (transactional)
    // and sometimes also in "MessageId". Normalise both.
    const messageId: string =
      req.body["message-id"] ??
      req.body.MessageId ??
      req.body.messageId ??
      "";

    const email: string =
      req.body.email ??
      req.body.to ??
      "";

    console.log(`[Webhook] Event    : ${event}`);
    console.log(`[Webhook] MessageId: "${messageId}"`);
    console.log(`[Webhook] Email    : ${email}`);

    // ── 2. Persist raw webhook event ──────────────────────
    try {
      await webhookRepository.create(
        "brevo",
        messageId,
        event,
        req.body
      );
    } catch (err) {
      // Non-fatal — log and continue
      console.error("[Webhook] Failed to persist webhook event:", err);
    }

    // ── 3. Skip if no messageId ───────────────────────────
    if (!messageId) {
      console.warn("[Webhook] No messageId in payload — cannot match recipient. Skipping.");
      return res.status(200).json({ success: true });
    }

    // ── 4. Map Brevo event → status ───────────────────────
    type RecipientStatus = "DELIVERED" | "OPENED" | "FAILED";
    const eventStatusMap: Record<string, RecipientStatus> = {
      delivered:  "DELIVERED",
      opened:     "OPENED",
      hardBounce: "FAILED",
      softBounce: "FAILED",
      blocked:    "FAILED",
      spam:       "FAILED",
      invalid:    "FAILED",
    };

    const newStatus = eventStatusMap[event] ?? null;

    if (!newStatus) {
      console.log(`[Webhook] Ignoring unmapped event type: "${event}"`);
      return res.status(200).json({ success: true });
    }

    console.log(`[Webhook] Mapped status: ${event} → ${newStatus}`);

    // ── 5. Find the CampaignRecipient ──────────────────────
    const recipient = await recipientRepository.findByProviderMessageId(messageId);

    if (!recipient) {
      console.warn(
        `[Webhook] ⚠️  No CampaignRecipient found for messageId="${messageId}". ` +
        `This means either the ID was not saved during send, or there is a format mismatch.`
      );
      return res.status(200).json({ success: true });
    }

    console.log(
      `[Webhook] ✅ Found CampaignRecipient id="${recipient.id}" ` +
      `current status="${recipient.status}"`
    );

    // ── 6. Idempotency guard ───────────────────────────────
    // Prevent going backwards: OPENED → DELIVERED, DELIVERED → SENT, etc.
    const statusRank: Record<string, number> = {
      PENDING:   0,
      SENT:      1,
      DELIVERED: 2,
      OPENED:    3,
      FAILED:    99,
    };

    const currentRank = statusRank[recipient.status] ?? 0;
    const newRank     = statusRank[newStatus] ?? 0;

    if (newStatus !== "FAILED" && newRank <= currentRank) {
      console.log(
        `[Webhook] Skipping status downgrade: ${recipient.status} → ${newStatus}`
      );
      return res.status(200).json({ success: true });
    }

    // ── 7. Update recipient status + timestamps ────────────
    // updateStatus() now sets deliveredAt when DELIVERED
    // and openedAt when OPENED, without overwriting the other.
    await recipientRepository.updateStatus(
      recipient.id,
      newStatus
      // Do NOT pass messageId here again — it is already stored.
      // Passing it overwrites it unnecessarily and can mask issues.
    );

    console.log(
      `[Webhook] ✅ Updated recipient id="${recipient.id}" → status="${newStatus}"`
    );

    // ── 8. Respond 200 immediately ─────────────────────────
    return res.status(200).json({ success: true });
  };
}
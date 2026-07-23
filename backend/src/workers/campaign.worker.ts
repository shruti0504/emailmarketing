import { Worker } from "bullmq";
import redis from "../config/redis.js";
import { CampaignRepository } from "../repositories/campaign.repository.js";
import { CampaignRecipientRepository } from "../repositories/campaignRecipient.repository.js";
import { MailService } from "../service/mail.service.js";

const campaignRepository = new CampaignRepository();
const recipientRepository = new CampaignRecipientRepository();
const mailService = new MailService();

const worker = new Worker(
  "campaignQueue",

  async (job) => {
    const { campaignId } = job.data;

    console.log("🚀 Sending campaign:", campaignId);

    const campaign =
      await campaignRepository.findWithRecipients(
        campaignId
      );

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    await campaignRepository.updateStatus(
      campaign.id,
      "SENDING"
    );

    for (const recipient of campaign.recipients) {

      if (!recipient.contact.email) {
        continue;
      }

      try {
const result = await mailService.sendMail(
  recipient.contact.email,
  recipient.contact.name,
  campaign.subject,
  campaign.body
);

await recipientRepository.updateStatus(
  recipient.id,
  "SENT",
  result.messageId
);

        console.log(
          `✅ Email sent to ${recipient.contact.email}`
        );

      } catch (error: any) {
  console.log(`❌ Failed ${recipient.contact.email}`);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Response:", error.response.data);
  } else {
    console.log(error.message);
  }

  await recipientRepository.updateStatus(
    recipient.id,
    "FAILED"
  );
}
    }

    await campaignRepository.updateStatus(
      campaign.id,
      "SENT"
    );
  },

  {
    connection: redis,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.log(error);
});

console.log("🚀 Campaign worker started");
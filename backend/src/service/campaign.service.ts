import { campaignQueue } from "../queues/campaign.queue.js";
import { CampaignRepository } from "../repositories/campaign.repository.js";
import { CampaignRecipientRepository } from "../repositories/campaignRecipient.repository.js";
import { CreateCampaignDto } from "../types/campaign.types.js";
import { AppError } from "../utils/AppError.js";
import { RecipientResolverService } from "./recipientResolver.service.js";
export class CampaignService {
 constructor(
  private campaignRepository = new CampaignRepository(),
  private recipientResolver = new RecipientResolverService(),
  private campaignRecipientRepository =
    new CampaignRecipientRepository()
) {}


 async createCampaign(
  workspaceId: string,
  data: CreateCampaignDto
) {

  if (!data.name.trim()) {
    throw new AppError("Campaign name is required.", 400);
  }

  if (!data.subject.trim()) {
    throw new AppError("Subject is required.", 400);
  }

  if (!data.body.trim()) {
    throw new AppError("Body is required.", 400);
  }

  const campaign =
    await this.campaignRepository.create(
      workspaceId,
      data
    );

  const recipients =
    await this.recipientResolver.resolveRecipients(
      workspaceId,
      {
        audienceId: data.audienceId,
        tags: data.tags,
        emails: data.emails,
      }
    );

  await this.campaignRecipientRepository.createMany(
    campaign.id,
    recipients.matched.map(
      (c: { id: string }) => c.id
    )
  );

  const delay = campaign.scheduledAt
  ? Math.max(
      new Date(campaign.scheduledAt).getTime() - Date.now(),
      0
    )
  : 0;
await campaignQueue.add(
  "send-campaign",
  {
    campaignId: campaign.id,
    workspaceId,
  },
  {
    delay,
  }
);
  return {
    campaign,
    matchedRecipients:
      recipients.matched.length,
    unmatched:
      recipients.unmatched,
  };

}

  async getCampaigns(
    workspaceId: string
  ) {
    return this.campaignRepository.findAll(
      workspaceId
    );
  }

  async getCampaignById(
    id: string,
    workspaceId: string
  ) {
    const campaign =
      await this.campaignRepository.findById(
        id,
        workspaceId
      );

    if (!campaign) {
      throw new AppError(
        "Campaign not found.",
        404
      );
    }

    return campaign;
  }
}
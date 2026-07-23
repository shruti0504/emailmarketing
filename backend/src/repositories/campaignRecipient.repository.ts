import prisma from "../config/prisma.js";

export class CampaignRecipientRepository {

  async createMany(
    campaignId: string,
    contactIds: string[]
  ) {

    return prisma.campaignRecipient.createMany({

      data: contactIds.map(contactId => ({
        campaignId,
        contactId
      })),

      skipDuplicates: true

    });

  }

  async updateStatus(
  id: string,
  status:
    | "PENDING"
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "FAILED",
  providerMessageId?: string
) {
  return prisma.campaignRecipient.update({
    where: {
      id,
    },
    data: {
      status,
      providerMessageId,
    },
  });
}

}
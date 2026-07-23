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

async findByMessageId(
  messageId: string
) {
  return prisma.campaignRecipient.findFirst({
    where: {
      providerMessageId: messageId,
    },
  });
}

async markDelivered(
  id: string
) {
  return prisma.campaignRecipient.update({
    where: {
      id,
    },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
    },
  });
}

async markOpened(
  id: string
) {
  return prisma.campaignRecipient.update({
    where: {
      id,
    },
    data: {
      status: "OPENED",
      openedAt: new Date(),
    },
  });
}
}
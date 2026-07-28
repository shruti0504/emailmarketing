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
  // Build the timestamp update depending on the new status.
  // IMPORTANT: Only set the timestamp for the current transition.
  // Do NOT overwrite deliveredAt when status moves to OPENED.
  const timestampData: Record<string, Date | undefined> = {};

  if (status === "DELIVERED") {
    timestampData.deliveredAt = new Date();
  }

  if (status === "OPENED") {
    timestampData.openedAt = new Date();
    // deliveredAt is intentionally NOT touched here —
    // Prisma partial update leaves it as-is in the database.
  }

  return prisma.campaignRecipient.update({
    where: { id },
    data: {
      status,
      ...(providerMessageId !== undefined && { providerMessageId }),
      ...timestampData,
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

async findByProviderMessageId(
  providerMessageId: string
) {
  return prisma.campaignRecipient.findFirst({
    where: {
      providerMessageId,
    },
  });
}
}


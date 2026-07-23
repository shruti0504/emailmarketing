import prisma from "../config/prisma.js";
import { CreateCampaignDto } from "../types/campaign.types.js";

export class CampaignRepository {

  async create(
    workspaceId: string,
    data: CreateCampaignDto
  ) {
    return prisma.campaign.create({
      data: {
        workspaceId,
        name: data.name,
        subject: data.subject,
        body: data.body,
        scheduledAt: data.scheduledAt
          ? new Date(data.scheduledAt)
          : null,
      },
    });
  }

  async findAll(workspaceId: string) {
    return prisma.campaign.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(
    id: string,
    workspaceId: string
  ) {
    return prisma.campaign.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async updateStatus(
    id: string,
    status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT"
  ) {
    return prisma.campaign.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
  async findWithRecipients(id: string) {
  return prisma.campaign.findUnique({
    where: {
      id,
    },
    include: {
      recipients: {
        include: {
          contact: true,
        },
      },
    },
  });
}
}
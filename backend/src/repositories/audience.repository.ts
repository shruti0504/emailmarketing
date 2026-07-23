import prisma from "../config/prisma.js";
import { CreateAudienceDto } from "../types/audience.types.js";

export class AudienceRepository {
  async create(
    workspaceId: string,
    data: CreateAudienceDto
  ) {
    return prisma.audience.create({
      data: {
        workspaceId,
        name: data.name,
        filterJson: data.filterJson,
      },
    });
  }

  async findAll(workspaceId: string) {
    return prisma.audience.findMany({
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
    return prisma.audience.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async delete(id: string) {
    return prisma.audience.delete({
      where: {
        id,
      },
    });
  }
}
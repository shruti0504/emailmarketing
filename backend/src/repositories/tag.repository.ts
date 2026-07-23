import prisma from "../config/prisma.js";

export class TagRepository {

  async findByName(
    workspaceId: string,
    name: string
  ) {
    return prisma.tag.findFirst({
      where: {
        workspaceId,
        name,
      },
    });
  }

  async create(
    workspaceId: string,
    name: string
  ) {
    return prisma.tag.create({
      data: {
        workspaceId,
        name,
      },
    });
  }

  async attachToContact(
    contactId: string,
    tagId: string
  ) {
    return prisma.contactTag.create({
      data: {
        contactId,
        tagId,
      },
    });
  }

  async removeAllTags(contactId: string) {
  return prisma.contactTag.deleteMany({
    where: {
      contactId,
    },
  });
}
}
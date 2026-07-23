import prisma from "../config/prisma.js";
import { CreateContactDto } from "../types/contact.types.js";


export class ContactRepository {
    
  async create(
    workspaceId: string,
    data: CreateContactDto
  ) {
    return prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        city: data.city,
        customFields: data.customFields,
        workspaceId,
      },
    });
  }


  async findDuplicate(
  workspaceId: string,
  email?: string,
  phone?: string
) {
  const conditions = [];

  if (email) {
    conditions.push({ email });
  }

  if (phone) {
    conditions.push({ phone });
  }

  // Nothing to check
  if (conditions.length === 0) {
    return null;
  }

  return prisma.contact.findFirst({
    where: {
      workspaceId,
      OR: conditions,
    },
  });
}
  async findAll(workspaceId: string) {
    return prisma.contact.findMany({
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
    return prisma.contact.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async update(
    id: string,
    data: Partial<CreateContactDto>
  ) {
    return prisma.contact.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.contact.delete({
      where: {
        id,
      },
    });
  }
}
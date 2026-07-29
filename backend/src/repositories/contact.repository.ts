import prisma from "../config/prisma.js";
import { CreateContactDto } from "../types/contact.types.js";


export class ContactRepository {
  public formatContact(contact: any) {
    if (!contact) return null;
    const { tags, ...rest } = contact;
    const formattedTags = Array.isArray(tags)
      ? tags.map((t: any) =>
          typeof t.tag?.name === "string"
            ? t.tag.name
            : typeof t.name === "string"
            ? t.name
            : String(t)
        )
      : [];
    return {
      ...rest,
      tags: formattedTags,
    };
  }
    
  async create(
    workspaceId: string,
    data: CreateContactDto
  ) {
    const cleanEmail = data.email?.trim() ? data.email.trim().toLowerCase() : null;
    const cleanPhone = data.phone?.trim() ? data.phone.trim() : null;
    const cleanCity = data.city?.trim() ? data.city.trim() : null;

    const contact = await prisma.contact.create({
      data: {
        name: data.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity,
        customFields: data.customFields || undefined,
        workspaceId,
      },
    });
    return this.formatContact(contact);
  }

  async findDuplicate(
    workspaceId: string,
    email?: string | null,
    phone?: string | null
  ) {
    const conditions = [];

    if (email && email.trim()) {
      conditions.push({ email: email.trim().toLowerCase() });
    }

    if (phone && phone.trim()) {
      conditions.push({ phone: phone.trim() });
    }

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
    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return contacts.map((c: any) => this.formatContact(c));
  }

  async findById(
    id: string,
    workspaceId: string
  ) {
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    return this.formatContact(contact);
  }

async update(
  id: string,
  workspaceId: string,
  data: Partial<CreateContactDto>
) {

  const { tags, ...contactData } = data;

  const updated = await prisma.contact.update({
    where: {
      id,
      workspaceId,
    },
    data: contactData,
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
  return this.formatContact(updated);
}

  async delete(id: string, workspaceId: string) {
    return prisma.contact.delete({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async findByFilters(
  workspaceId: string,
  filters: {
    city?: string;
    tags?: string[];
  }
) {
  return prisma.contact.findMany({
    where: {
      workspaceId,

      ...(filters.city && {
        city: filters.city,
      }),

      ...(filters.tags?.length && {
        tags: {
          some: {
            tag: {
              name: {
                in: filters.tags,
              },
            },
          },
        },
      }),
    },

    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

async findByEmails(
  workspaceId: string,
  emails: string[]
) {
  return prisma.contact.findMany({
    where: {
      workspaceId,
      email: {
        in: emails,
      },
    },
  });
}
}
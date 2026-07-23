import { ContactRepository } from "../repositories/contact.repository.js";
import { CreateContactDto } from "../types/contact.types.js";
import { AppError } from "../utils/AppError.js";

export class ContactService {
  constructor(
    private contactRepository = new ContactRepository()
  ) {}

  async createContact(
    workspaceId: string,
    data: CreateContactDto
  ) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.trim();

    const existingContact =
      await this.contactRepository.findDuplicate(
        workspaceId,
        email,
        phone
      );

    if (existingContact) {
      throw new AppError(
        "A contact with this email or phone already exists.",
        409
      );
    }

    return this.contactRepository.create(
      workspaceId,
      {
        ...data,
        name,
        email,
        phone,
      }
    );
  }
  async getContacts(workspaceId: string) {
  return this.contactRepository.findAll(workspaceId);
}
async getContactById(
  id: string,
  workspaceId: string
) {
  const contact =
    await this.contactRepository.findById(
      id,
      workspaceId
    );

  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  return contact;
}
async updateContact(
  id: string,
  workspaceId: string,
  data: Partial<CreateContactDto>
) {
  const contact =
    await this.contactRepository.findById(
      id,
      workspaceId
    );

  if (!contact) {
    throw new AppError("Contact not found", 404);
  }

  const email =
    data.email?.trim().toLowerCase();

  const phone =
    data.phone?.trim();

  if (email || phone) {
    const duplicate =
      await this.contactRepository.findDuplicate(
        workspaceId,
        email,
        phone
      );

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new AppError(
        "A contact with this email or phone already exists.",
        409
      );
    }
  }

  return this.contactRepository.update(id, {
    ...data,
    email,
    phone,
    name: data.name?.trim(),
  });
}
async deleteContact(
  id: string,
  workspaceId: string
) {
  const contact =
    await this.contactRepository.findById(
      id,
      workspaceId
    );

  if (!contact) {
    throw new AppError(
      "Contact not found",
      404
    );
  }

  await this.contactRepository.delete(id);
}
}
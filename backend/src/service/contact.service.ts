import { ContactRepository } from "../repositories/contact.repository.js";
import { CreateContactDto } from "../types/contact.types.js";
import { AppError } from "../utils/AppError.js";
import { TagService } from "./tag.service.js";

export class ContactService {
  constructor(
    private contactRepository = new ContactRepository(),
      private tagService = new TagService()
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
const contact =
  await this.contactRepository.create(
    workspaceId,
    {
      ...data,
      name,
      email,
      phone,
    }
  );

await this.tagService.assignTags(
  workspaceId,
  contact.id,
  data.tags || []
);

return contact;
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
const updated =
  await this.contactRepository.update(
    id,
    {
      ...data,
      name: data.name?.trim(),
      email,
      phone,
    }
  );

if (data.tags) {
  await this.tagService.replaceTags(
    workspaceId,
    id,
    data.tags
  );
}

return updated;
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
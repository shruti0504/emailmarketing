import { ContactRepository } from "../repositories/contact.repository.js";
import { CreateContactDto } from "../types/contact.types.js";
import { AppError } from "../utils/AppError.js";
import { TagService } from "./tag.service.js";

export class ContactService {
  constructor(
    private contactRepository = new ContactRepository(),
    private tagService = new TagService()
  ) {}

  async createContact(workspaceId: string, data: CreateContactDto) {
    const name = data.name ? data.name.trim() : "";
    if (!name) {
      throw new AppError("Contact name is required.", 400);
    }

    const email = data.email?.trim() ? data.email.trim().toLowerCase() : undefined;
    const phone = data.phone?.trim() ? data.phone.trim() : undefined;
    const city = data.city?.trim() ? data.city.trim() : undefined;

    const existingContact = await this.contactRepository.findDuplicate(
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

    const contact = await this.contactRepository.create(workspaceId, {
      ...data,
      name,
      email,
      phone,
      city,
    });

    if (contact && data.tags && data.tags.length > 0) {
      await this.tagService.assignTags(
        workspaceId,
        contact.id,
        data.tags
      );
    }

    return this.getContactById(contact.id, workspaceId);
  }

  async getContacts(workspaceId: string) {
    return this.contactRepository.findAll(workspaceId);
  }

  async getContactById(id: string, workspaceId: string) {
    const contact = await this.contactRepository.findById(id, workspaceId);

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
    const contact = await this.contactRepository.findById(id, workspaceId);

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const name = data.name !== undefined ? data.name.trim() : undefined;
    const email = data.email?.trim() ? data.email.trim().toLowerCase() : undefined;
    const phone = data.phone?.trim() ? data.phone.trim() : undefined;
    const city = data.city ? data.city.trim() : undefined;

    if (email || phone) {
      const duplicate = await this.contactRepository.findDuplicate(
        workspaceId,
        email,
        phone
      );

      if (duplicate && duplicate.id !== id) {
        throw new AppError(
          "A contact with this email or phone already exists.",
          409
        );
      }
    }

    await this.contactRepository.update(id, workspaceId, {
      ...data,
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(city !== undefined && { city }),
    });

    if (data.tags !== undefined) {
      await this.tagService.replaceTags(workspaceId, id, data.tags);
    }

    return this.getContactById(id, workspaceId);
  }

  async deleteContact(id: string, workspaceId: string) {
    const contact = await this.contactRepository.findById(id, workspaceId);

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    await this.contactRepository.delete(id, workspaceId);
  }
}
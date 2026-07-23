import { TagRepository } from "../repositories/tag.repository.js";

export class TagService {
  constructor(
    private tagRepository = new TagRepository()
  ) {}

  async assignTags(
    workspaceId: string,
    contactId: string,
    tags: string[]
  ) {
    for (const tagName of tags) {
      const cleanName = tagName.trim();

      if (!cleanName) continue;

      let tag = await this.tagRepository.findByName(
        workspaceId,
        cleanName
      );

      if (!tag) {
        tag = await this.tagRepository.create(
          workspaceId,
          cleanName
        );
      }

      await this.tagRepository.attachToContact(
        contactId,
        tag.id
      );
    }
  }

  async replaceTags(
    workspaceId: string,
    contactId: string,
    tags: string[]
  ) {
    // Remove all existing tags for the contact
    await this.tagRepository.removeAllTags(contactId);

    // Assign the new tags
    await this.assignTags(
      workspaceId,
      contactId,
      tags
    );
  }
}
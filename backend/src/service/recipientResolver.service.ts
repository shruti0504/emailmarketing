import { AudienceRepository } from "../repositories/audience.repository.js";
import { ContactRepository } from "../repositories/contact.repository.js";

export class RecipientResolverService {
  constructor(
    private audienceRepository = new AudienceRepository(),
    private contactRepository = new ContactRepository()
  ) {}

  async resolveRecipients(
    workspaceId: string,
    options: {
      audienceId?: string;
      tags?: string[];
    }
  ) {
    // Audience selection
    if (options.audienceId) {
      const audience = await this.audienceRepository.findById(
        options.audienceId,
        workspaceId
      );

      if (!audience) {
        throw new Error("Audience not found.");
      }

      const filters = audience.filterJson as {
        city?: string;
        tags?: string[];
      };

      return {
        matched: await this.contactRepository.findByFilters(
          workspaceId,
          filters
        ),
        unmatched: [],
      };
    }

    // Filter by Tags directly
    if (options.tags?.length) {
      return {
        matched: await this.contactRepository.findByFilters(workspaceId, {
          tags: options.tags,
        }),
        unmatched: [],
      };
    }

    return {
      matched: [],
      unmatched: [],
    };
  }
}
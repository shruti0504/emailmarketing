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
    emails?: string[];
  }
) {

  // -------------------
  // Audience
  // -------------------
  if (options.audienceId) {

    const audience =
      await this.audienceRepository.findById(
        options.audienceId,
        workspaceId
      );

    if (!audience) {
      throw new Error("Audience not found.");
    }

    const filters =
      audience.filterJson as {
        city?: string;
        tags?: string[];
      };

    return {
      matched:
        await this.contactRepository.findByFilters(
          workspaceId,
          filters
        ),
      unmatched: []
    };
  }

  // -------------------
  // Tags
  // -------------------
  if (options.tags?.length) {

    return {
      matched:
        await this.contactRepository.findByFilters(
          workspaceId,
          {
            tags: options.tags
          }
        ),
      unmatched: []
    };
  }

  // -------------------
  // Email List
  // -------------------
  if (options.emails?.length) {

    const contacts =
      await this.contactRepository.findByEmails(
        workspaceId,
        options.emails
      );

    const matchedEmails =
      contacts.map((c: { email: string | null }) => c.email);

    const unmatched =
      options.emails.filter(
        email => !matchedEmails.includes(email)
      );

    return {
      matched: contacts,
      unmatched
    };
  }

  return {
    matched: [],
    unmatched: []
  };
}
}
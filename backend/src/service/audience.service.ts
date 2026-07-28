import { AudienceRepository } from "../repositories/audience.repository.js";
import { ContactRepository } from "../repositories/contact.repository.js";
import { CreateAudienceDto } from "../types/audience.types.js";

export class AudienceService {
  constructor(
    private audienceRepository = new AudienceRepository(),
      private contactRepository = new ContactRepository()
  ) {}

  async createAudience(
    workspaceId: string,
    data: CreateAudienceDto
  ) {
    return this.audienceRepository.create(
      workspaceId,
      data
    );
  }

async getAudiences(
  workspaceId: string
) {
  const audiences =
    await this.audienceRepository.findAll(
      workspaceId
    );

  return Promise.all(
    audiences.map(async (audience: any) => {

      const filters =
        audience.filterJson as {
          city?: string;
          tags?: string[];
        };

      const contacts =
        await this.contactRepository.findByFilters(
          workspaceId,
          filters
        );

      return {
        ...audience,
        count: contacts.length,
      };
    })
  );
}

async getAudienceById(
  id: string,
  workspaceId: string
) {
  const audience =
    await this.audienceRepository.findById(
      id,
      workspaceId
    );

  if (!audience) {
    throw new Error("Audience not found");
  }

  const filters =
    audience.filterJson as {
      city?: string;
      tags?: string[];
    };

  const contacts =
    await this.contactRepository.findByFilters(
      workspaceId,
      filters
    );

  return {
    ...audience,
    count: contacts.length,
    contacts,
  };
}

  async deleteAudience(
    id: string,
    workspaceId: string
  ) {
    const audience =
      await this.audienceRepository.findById(
        id,
        workspaceId
      );

    if (!audience) {
      throw new Error("Audience not found");
    }

    await this.audienceRepository.delete(id, workspaceId);
  }
}
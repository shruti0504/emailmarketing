export interface CreateAudienceDto {
  name: string;

  filterJson: {
    city?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };
}
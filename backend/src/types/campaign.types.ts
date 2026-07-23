export interface CreateCampaignDto {
  name: string;
  subject: string;
  body: string;

  audienceId?: string;
  tags?: string[];
  emails?: string[];

  scheduledAt?: string;
}
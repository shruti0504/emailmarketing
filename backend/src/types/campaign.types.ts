export interface CreateCampaignDto {
  name: string;
  subject: string;
  body: string;

  audienceId?: string;
  tags?: string[];

  scheduledAt?: string | null;
}
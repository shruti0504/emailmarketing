export interface CreateCampaignDto {
  name: string;
  subject: string;
  body: string;

  audienceId?: string;
  tags?: string[];

  scheduledAt?: string | null;

  attachmentName?: string | null;
  attachmentUrl?: string | null;
  attachmentContent?: string | null;
}
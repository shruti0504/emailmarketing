import { Contact } from "./contact";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT";
export type RecipientStatus = "PENDING" | "SENT" | "DELIVERED" | "OPENED" | "FAILED";

export interface CreateCampaignPayload {
  name: string;
  subject: string;
  body: string;

  audienceId?: string;
  tags?: string[];

  scheduledAt?: string;

  attachmentName?: string | null;
  attachmentUrl?: string | null;
  attachmentContent?: string | null;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  providerMessageId?: string | null;
  status: RecipientStatus;
  deliveredAt?: string | null;
  openedAt?: string | null;
  contact?: Contact;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  subject: string;
  body: string;
  status: CampaignStatus;
  scheduledAt?: string | null;
  providerId?: string | null;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  attachmentContent?: string | null;
  createdAt: string;
  recipients?: CampaignRecipient[];
}

export interface CampaignAnalytics {
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
}

export interface CampaignApiResponse {
  success: boolean;
  message?: string;
  data: Campaign;
}

export interface CampaignsApiResponse {
  success: boolean;
  data: Campaign[];
}

export interface CampaignAnalyticsApiResponse {
  success: boolean;
  data: CampaignAnalytics;
}

export interface CreateCampaignResult {
  campaign: Campaign;
  matchedRecipients: number;
  unmatched: string[];
}

export interface CreateCampaignApiResponse {
  success: boolean;
  message: string;
  data: CreateCampaignResult;
}

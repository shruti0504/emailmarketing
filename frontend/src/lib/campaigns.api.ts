import api from "./api";
import {
  Campaign,
  CreateCampaignPayload,
  CampaignsApiResponse,
  CampaignApiResponse,
  CampaignAnalyticsApiResponse,
  CampaignAnalytics,
  CreateCampaignApiResponse,
  CreateCampaignResult,
} from "@/types/campaign";

export const createCampaign = async (
  payload: CreateCampaignPayload
): Promise<CreateCampaignResult> => {
  const response = await api.post<CreateCampaignApiResponse>(
    "/campaigns",
    payload
  );
  return response.data.data;
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await api.get<CampaignsApiResponse>("/campaigns");
  return response.data.data;
};

export const getCampaignById = async (id: string): Promise<Campaign> => {
  const response = await api.get<CampaignApiResponse>(`/campaigns/${id}`);
  return response.data.data;
};

export const getCampaignAnalytics = async (
  id: string
): Promise<CampaignAnalytics> => {
  const response = await api.get<CampaignAnalyticsApiResponse>(
    `/campaigns/${id}/analytics`
  );
  return response.data.data;
};

export const deleteCampaign = async (id: string): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete<{ success: boolean; message?: string }>(
    `/campaigns/${id}`
  );
  return response.data;
};

import api from "./api";
import {
  Audience,
  CreateAudiencePayload,
  AudiencesApiResponse,
  AudienceApiResponse,
  DeleteAudienceApiResponse,
} from "@/types/audience";

export const createAudience = async (
  body: CreateAudiencePayload
): Promise<Audience> => {
  const response =
    await api.post<AudienceApiResponse>(
      "/audiences",
      body
    );

  return response.data.data;
};

export const getAudiences = async (): Promise<Audience[]> => {
  const response =
    await api.get<AudiencesApiResponse>(
      "/audiences"
    );

  return response.data.data;
};

export const getAudienceById = async (
  id: string
): Promise<Audience> => {
  const response =
    await api.get<AudienceApiResponse>(
      `/audiences/${id}`
    );

  return response.data.data;
};

export const deleteAudience = async (
  id: string
): Promise<DeleteAudienceApiResponse> => {
  const response =
    await api.delete<DeleteAudienceApiResponse>(
      `/audiences/${id}`
    );

  return response.data;
};
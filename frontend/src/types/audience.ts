export interface AudienceFilter {
city?: string;
tags?: string[];
customFields?: Record<string, any>;
}

export interface CreateAudiencePayload {
name: string;
filterJson: AudienceFilter;
}

export interface Audience {
id: string;
workspaceId: string;
name: string;
filterJson: AudienceFilter;
createdAt: string;
count?: number;
}

export interface AudienceApiResponse {
success: boolean;
data: Audience;
}

export interface AudiencesApiResponse {
success: boolean;
data: Audience[];
}

export interface DeleteAudienceApiResponse {
success: boolean;
message: string;
}

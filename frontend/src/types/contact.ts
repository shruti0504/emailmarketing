export interface CreateContactPayload {
    name: string;
    email: string;
    phone: string;
    city?: string;
    tags?: string[];
    customFields?: Record<string, string>;
}

export interface Contact extends CreateContactPayload {
    id: string;
    workspaceId: string;
    createdAt: string;
}

export interface ContactApiResponse {
    success: boolean;
    message?: string;
    data: Contact;
}

export interface ContactsApiResponse {
    success: boolean;
    data: Contact[];
}

export interface DeleteContactApiResponse {
    success: boolean;
    message: string;
}
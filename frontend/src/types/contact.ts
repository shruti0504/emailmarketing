export interface CreateContactPayload {
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    tags?: string[];
    customFields?: Record<string, string>;
}

export interface Contact {
    id: string;
    workspaceId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    tags?: string[];
    customFields?: Record<string, string> | null;
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
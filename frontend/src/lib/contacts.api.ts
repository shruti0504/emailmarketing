
import {
    Contact,
    CreateContactPayload,
    ContactApiResponse,
    ContactsApiResponse,
    DeleteContactApiResponse,
}  from "@/types/contact";
import api from "./api";

export const createContact = async (
    data: CreateContactPayload
): Promise<Contact> => {
    const response = await api.post<ContactApiResponse>(
        "/contacts",
        data
    );

    return response.data.data;
};

export const getContacts = async (): Promise<Contact[]> => {
    const response = await api.get<ContactsApiResponse>(
        "/contacts"
    );

    return response.data.data;
};

export const getContactById = async (
    id: string
): Promise<Contact> => {
    const response = await api.get<ContactApiResponse>(
        `/contacts/${id}`
    );

    return response.data.data;
};

export const updateContact = async (
    id: string,
    data: Partial<CreateContactPayload>
): Promise<Contact> => {
    const response = await api.put<ContactApiResponse>(
        `/contacts/${id}`,
        data
    );

    return response.data.data;
};

export const deleteContact = async (
    id: string
): Promise<DeleteContactApiResponse> => {
    const response = await api.delete<DeleteContactApiResponse>(
        `/contacts/${id}`
    );

    return response.data;
};

export const importContacts = async (
    file: File
) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/contacts/import",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};
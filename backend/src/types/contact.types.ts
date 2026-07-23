export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  city?: string;
  customFields?: Record<string, any>;
}
export interface CreateContactDto {
  name: string;
  email: string;
  phone: string;
  city?: string;

  tags?: string[];
  customFields?: Record<string, any>;
}
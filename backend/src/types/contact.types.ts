export interface CreateContactDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  tags?: string[];
  customFields?: Record<string, any>;
}
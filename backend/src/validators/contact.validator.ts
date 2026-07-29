import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required"),

  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .nullable()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),

  city: z.string().trim().optional().nullable().or(z.literal("")),

  tags: z.array(z.string().trim()).optional(),

  customFields: z.record(z.string(), z.any()).optional(),
});

export const updateContactSchema = z.object({
  name: z.string().trim().min(1, "Contact name is required").optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .optional()
    .nullable()
    .or(z.literal("")),

  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),

  city: z.string().trim().optional().nullable().or(z.literal("")),

  tags: z.array(z.string().trim()).optional(),

  customFields: z.record(z.string(), z.any()).optional(),
});
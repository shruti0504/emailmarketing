import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(2),

  email: z.string().trim().email(),

  phone: z.string().trim().min(10),

  city: z.string().trim().optional(),

  //customFields: z.record(z.any()).optional(),
});
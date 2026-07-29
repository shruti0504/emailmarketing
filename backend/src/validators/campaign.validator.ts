import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required"),
  subject: z.string().trim().min(1, "Subject is required"),
  body: z.string().trim().min(1, "Body content is required"),
  audienceId: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  scheduledAt: z
    .string()
    .datetime({ message: "scheduledAt must be a valid ISO date-time string" })
    .optional()
    .or(z.literal(""))
    .nullable(),
}).refine((data) => !!data.audienceId || (!!data.tags && data.tags.length > 0), {
  message: "Please select an audience or provide at least one contact tag.",
});

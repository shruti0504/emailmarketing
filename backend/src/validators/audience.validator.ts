import { z } from "zod";

export const createAudienceSchema = z.object({
  name: z.string().trim().min(1, "Audience name is required"),
  filterJson: z.object({
    city: z.string().trim().optional(),
    tags: z.array(z.string().trim()).optional(),
  }).refine((data) => !!data.city || (!!data.tags && data.tags.length > 0), {
    message: "At least a city or one tag must be specified for the audience segment",
  }),
});

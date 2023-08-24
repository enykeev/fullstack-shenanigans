import { z } from "zod";

export const Audience = z.object({
  appId: z.string(),
  audienceId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  filter: z.string(),
});

export type Audience = z.infer<typeof Audience>;

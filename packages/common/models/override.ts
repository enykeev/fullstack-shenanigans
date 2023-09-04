import { z } from "zod";

import { AllMetaTypes } from "..";

export const BaseOverride = z.object({
  appId: z.string(),
  overrideId: z.string(),
  flagId: z.string(),
  audienceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BaseOverride = z.infer<typeof BaseOverride>;

export const Override = BaseOverride.and(AllMetaTypes);

export type Override = z.infer<typeof Override>;

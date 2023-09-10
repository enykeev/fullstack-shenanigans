import { z } from "zod";

import { Audience } from "./audience";
import { Flag } from "./flag";
import { Override } from "./override";

export const OverrideWithAudience = Override.and(
  z.object({
    audience: Audience,
  }),
);

export type OverrideWithAudience = z.infer<typeof OverrideWithAudience>;

export const FlagWithOverrides = Flag.and(
  z.object({
    overrides: z.array(OverrideWithAudience),
  }),
);

export type FlagWithOverrides = z.infer<typeof FlagWithOverrides>;

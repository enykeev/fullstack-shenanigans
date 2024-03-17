import { z } from "zod";

import { Audience } from "./audience";
import { Flag } from "./flag";
import { Override } from "./override";

export const ExpandedOverride = Override.and(
  z.object({
    audience: Audience,
    flag: Flag,
  }),
);

export type ExpandedOverride = z.infer<typeof ExpandedOverride>;

export const FlagWithOverrides = Flag.and(
  z.object({
    overrides: z.array(
      Override.and(
        z.object({
          audience: Audience,
        }),
      ),
    ),
  }),
);

export type FlagWithOverrides = z.infer<typeof FlagWithOverrides>;

export const AudienceWithOverrides = Audience.and(
  z.object({
    overrides: z.array(
      Override.and(
        z.object({
          flag: Flag,
        }),
      ),
    ),
  }),
);
export type AudienceWithOverrides = z.infer<typeof AudienceWithOverrides>;

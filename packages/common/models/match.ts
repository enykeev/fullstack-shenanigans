import { z } from "zod";

export const MatchRequest = z.object({
  returns: z.enum(["audiences", "overrides", "flags"]),
  context: z.record(z.any()),
});

export type MatchRequest = z.infer<typeof MatchRequest>;

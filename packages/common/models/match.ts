import { z } from "zod";

export const MatchRequest = z.object({
  returns: z.enum(["audiences", "overrides", "flags"]),
  context: z.record(z.any()),
});

export type MatchRequest = z.infer<typeof MatchRequest>;

export const EvaluateRequest = z.object({
  context: z.record(z.any()),
});

export type EvaluateRequest = z.infer<typeof EvaluateRequest>;

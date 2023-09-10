import { z } from "zod";

export const Context = z.record(z.any());
export type Context = z.infer<typeof Context>;

export const MatchRequest = z.object({
  returns: z.enum(["audiences", "overrides", "flags"]),
  context: z.record(z.any()),
});
export type MatchRequest = z.infer<typeof MatchRequest>;

export const EvaluateRequest = z.object({
  context: Context,
});
export type EvaluateRequest = z.infer<typeof EvaluateRequest>;

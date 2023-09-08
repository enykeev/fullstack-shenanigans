import { z } from "zod";

export const envSchema = z.object({
  PUBLIC_URL: z.string(),
  PORT: z.string().optional(),

  ISSUER: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),

  SESSION_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export default envSchema.parse(Bun.env);

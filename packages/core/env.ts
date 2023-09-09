import { z } from "zod";

function StringBoolean() {
  return z.coerce
    .string()
    .transform((v) => new Set(["true", "yes", "on", "1"]).has(v.toLowerCase()));
}

export const envSchema = z.object({
  PROVISION_MOCK_DATA: StringBoolean().optional(),

  PUBLIC_URL: z.string(),
  PORT: z.coerce.number().optional(),

  ISSUER: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),

  SESSION_COOKIE_NAME: z.string(),
  SESSION_SECRET: z.string(),
  SESSION_EXPIRATION: z.coerce.number().optional(),

  TOKEN_EXPIRATION: z.coerce.number().optional(),
});

export type Env = z.infer<typeof envSchema>;
export default envSchema.parse(Bun.env);

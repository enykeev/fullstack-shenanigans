import { z } from "zod";

export const BaseFlag = z.object({
  appId: z.string(),
  flagId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  type: z.string(),
});

export type BaseFlag = z.infer<typeof BaseFlag>;

export const BooleanFlagMeta = z.object({
  type: z.enum(["boolean"]),
  value: z.boolean(),
});

export type BooleanFlagMeta = z.infer<typeof BooleanFlagMeta>;

export const StringFlagMeta = z.object({
  type: z.enum(["string"]),
  value: z.string(),
});

export type StringFlagMeta = z.infer<typeof StringFlagMeta>;

export const NumberFlagMeta = z.object({
  type: z.enum(["number"]),
  value: z.number(),
});

export type NumberFlagMeta = z.infer<typeof NumberFlagMeta>;

export const AllMetaTypes = z.union([
  BooleanFlagMeta,
  StringFlagMeta,
  NumberFlagMeta,
]);

export const Flag = BaseFlag.and(AllMetaTypes);

export type Flag = z.infer<typeof Flag>;

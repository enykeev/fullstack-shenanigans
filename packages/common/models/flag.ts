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

export type AllMetaTypes = z.infer<typeof AllMetaTypes>;

export const AllMetaTypesOptional = z.union([
  BooleanFlagMeta.partial(),
  StringFlagMeta.partial(),
  NumberFlagMeta.partial(),
]);

export type AllMetaTypesOptional = z.infer<typeof AllMetaTypesOptional>;

export const Flag = BaseFlag.and(AllMetaTypes);

export type Flag = z.infer<typeof Flag>;

export const PostFlagBody = BaseFlag.pick({
  flagId: true,
  name: true,
  description: true,
}).and(AllMetaTypes);

export type PostFlagBody = z.infer<typeof PostFlagBody>;

export const PutFlagBody = BaseFlag.pick({
  name: true,
  description: true,
})
  .partial({
    name: true,
    description: true,
  })
  .and(AllMetaTypesOptional);

export type PutFlagBody = z.infer<typeof PutFlagBody>;

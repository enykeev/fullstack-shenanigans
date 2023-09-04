import { AllMetaTypes } from "@feature-flag-service/common";
import { relations } from "drizzle-orm";
import { blob, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const apiKeysTable = sqliteTable(
  "apiKeys",
  {
    appId: text("appId").notNull(),
    apiKey: text("apiKey").notNull(),
    createdAt: text("createdAt").notNull(),
    expiresAt: text("expiresAt").notNull(),
  },
  (t) => ({
    pk: primaryKey(t.apiKey),
  }),
);

export const flagTable = sqliteTable(
  "flags",
  {
    appId: text("appId").notNull(),
    flagId: text("flagId").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
    meta: blob("meta", { mode: "json" }).notNull().$type<AllMetaTypes>(),
  },
  (t) => ({
    pk: primaryKey(t.appId, t.flagId),
  }),
);

export const audienceTable = sqliteTable(
  "audiences",
  {
    appId: text("appId").notNull(),
    audienceId: text("audienceId").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
    meta: blob("meta", { mode: "json" }).notNull().$type<{ filter: string }>(),
  },
  (t) => ({
    pk: primaryKey(t.appId, t.audienceId),
  }),
);

export const overrideTable = sqliteTable(
  "overrides",
  {
    appId: text("appId").notNull(),
    overrideId: text("overrideId").notNull(),
    flagId: text("flagId").notNull(),
    audienceId: text("audienceId").notNull(),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
    meta: blob("meta", { mode: "json" }).notNull().$type<AllMetaTypes>(),
  },
  (t) => ({
    pk: primaryKey(t.appId, t.overrideId),
  }),
);

export const flagOverrideRelations = relations(flagTable, ({ many }) => ({
  overrides: many(overrideTable),
}));

export const audienceOverrideRelations = relations(
  audienceTable,
  ({ many }) => ({
    overrides: many(overrideTable),
  }),
);

export const overrideFlagRelations = relations(overrideTable, ({ one }) => ({
  flag: one(flagTable, {
    fields: [overrideTable.flagId],
    references: [flagTable.flagId],
  }),
}));

export const overrideAudienceRelations = relations(
  overrideTable,
  ({ one }) => ({
    audience: one(audienceTable, {
      fields: [overrideTable.audienceId],
      references: [audienceTable.audienceId],
    }),
  }),
);

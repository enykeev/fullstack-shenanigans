import { text, sqliteTable, blob, primaryKey } from "drizzle-orm/sqlite-core";

export const flagTable = sqliteTable(
  "flags",
  {
    appId: text("appId").notNull(),
    flagId: text("flagId").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: text("createdAt").notNull(),
    updatedAt: text("updatedAt").notNull(),
    meta: blob("meta", { mode: "json" })
      .notNull()
      .$type<Record<string, unknown>>(),
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
    meta: blob("meta", { mode: "json" })
      .notNull()
      .$type<Record<string, unknown>>(),
  },
  (t) => ({
    pk: primaryKey(t.appId, t.audienceId),
  }),
);

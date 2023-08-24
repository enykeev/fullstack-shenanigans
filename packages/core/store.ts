import type { Audience, Flag } from "@feature-flag-service/common";
import { Database } from "bun:sqlite";
import { InferSelectModel, and, eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle, BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { audienceTable, flagTable } from "./schema";

export const sqlite = new Database();
export const db: BunSQLiteDatabase = drizzle(sqlite);

type SelectFlagDB = InferSelectModel<typeof flagTable>;
type SelectAudienceDB = InferSelectModel<typeof audienceTable>;

export type InitArgs = {
  provisionMockData?: boolean;
};

export function init({ provisionMockData = false }: InitArgs = {}) {
  migrate(db, { migrationsFolder: "migrations" });

  if (provisionMockData) {
    for (let i = 0; i < 10; i++) {
      createFlag({
        appId: "some-app-id",
        flagId: "maintenance" + i,
        name: "Maintenance",
        description:
          "Enable maintenance mode for the application, routing all affected traffic to a static page",
        createdAt: "2023-08-12T22:07:37.783Z",
        updatedAt: "2023-08-12T22:08:02.709Z",
        type: "boolean",
        value: false,
      });

      createFlag({
        appId: "some-app-id",
        flagId: "holiday-nl-1" + i,
        name: "Kings Day",
        description:
          "Overrides default theme of the website to an orange one in celebration of the national holiday",
        createdAt: "2023-08-12T22:07:37.783Z",
        updatedAt: new Date().toISOString(),
        type: "boolean",
        value: false,
      });

      createFlag({
        appId: "some-app-id",
        flagId: "pricing-experiment-44" + i,
        name: "Pricing experiment #44",
        description: "Another iteration of introductory pricing experiment",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: "boolean",
        value: false,
      });
    }

    createAudience({
      appId: "some-app-id",
      audienceId: "testers",
      name: "QA Engineers",
      description: "Group that includes all QA engineers",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      filter:
        "user.email in ['james@qa.local', 'mike@qa.local', 'dan@leadership.local']",
    });
  }
}

export type ListFlagArgs = Pick<SelectFlagDB, "appId">;
export type ListFlagResult = Flag[];

export function listFlags({ appId }: ListFlagArgs): ListFlagResult {
  const res = db
    .select()
    .from(flagTable)
    .where(eq(flagTable.appId, sql.placeholder("appId")))
    .all({ appId });
  return res.map((flag) => {
    const { meta, ...rest } = flag;
    return { ...rest, ...meta };
  });
}

export type GetFlagArgs = Pick<SelectFlagDB, "appId" | "flagId">;
export type GetFlagResult = Flag | null;

export function getFlag({ appId, flagId }: GetFlagArgs): GetFlagResult {
  const res = db
    .select()
    .from(flagTable)
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .limit(1)
    .all({ appId, flagId })
    .at(0);
  if (!res) {
    return null;
  }

  const { meta, ...rest } = res;

  return { ...rest, ...meta };
}

export type CreateFlagArgs = Omit<
  SelectFlagDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectFlagDB, "createdAt" | "updatedAt">> &
  SelectFlagDB["meta"];

export function createFlag({
  appId,
  flagId,
  name,
  description,
  createdAt,
  updatedAt,
  ...rest
}: CreateFlagArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  if (!createdAt) {
    createdAt = updatedAt;
  }
  const res = db
    .insert(flagTable)
    .values({
      appId,
      flagId,
      name,
      description,
      createdAt,
      updatedAt,
      meta: rest,
    })
    .run();
  return res;
}

export type updateFlagArgs = Omit<
  SelectFlagDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectFlagDB, "updatedAt">> &
  SelectFlagDB["meta"];

export function updateFlag({
  appId,
  flagId,
  name,
  description,
  updatedAt,
  ...rest
}: updateFlagArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  return db
    .update(flagTable)
    .set({
      name,
      description,
      updatedAt,
      meta: rest,
    })
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .run({ appId, flagId });
}

export type DeleteFlagArgs = Pick<SelectFlagDB, "appId" | "flagId">;

export function deleteFlag({ appId, flagId }: DeleteFlagArgs) {
  return db
    .delete(flagTable)
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .run({ appId, flagId });
}

export type GetFlagValueArgs = Pick<SelectFlagDB, "appId" | "flagId">;
export type GetFlagValueResult = Record<string, unknown> | null;

export function getFlagValue({
  appId,
  flagId,
}: GetFlagValueArgs): GetFlagValueResult {
  const flag = db
    .select()
    .from(flagTable)
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .limit(1)
    .all({ appId, flagId })
    .at(0);
  if (!flag) {
    return null;
  }
  return flag.meta;
}

export type SetFlagValueArgs = Pick<SelectFlagDB, "appId" | "flagId"> &
  SelectFlagDB["meta"];

export function setFlagValue({
  appId,
  flagId,
  ...rest
}: SetFlagValueArgs): GetFlagValueResult {
  const flag = db
    .select()
    .from(flagTable)
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .limit(1)
    .all({ appId, flagId })
    .at(0);
  if (!flag) {
    return null;
  }
  const updatedAt = new Date().toISOString();
  db.update(flagTable)
    .set({
      ...flag,
      updatedAt,
      meta: rest,
    })
    .where(
      and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    )
    .run({ appId, flagId });
  return rest;
}

export type ListAudiencesArgs = Pick<SelectAudienceDB, "appId">;
export type ListAudiencesResult = Audience[];

export function listAudiences({
  appId,
}: ListAudiencesArgs): ListAudiencesResult {
  const res = db
    .select()
    .from(audienceTable)
    .where(eq(audienceTable.appId, sql.placeholder("appId")))
    .all({ appId })
    .map((audience) => {
      const { meta, ...rest } = audience;
      return { ...rest, ...meta };
    });
  return res;
}

export type GetAudienceArgs = Pick<SelectAudienceDB, "appId" | "audienceId">;
export type GetAudienceResult = Audience | null;

export function getAudience({
  appId,
  audienceId,
}: GetAudienceArgs): GetAudienceResult {
  const res = db
    .select()
    .from(audienceTable)
    .where(
      and(
        eq(audienceTable.appId, sql.placeholder("appId")),
        eq(audienceTable.audienceId, sql.placeholder("audienceId")),
      ),
    )
    .limit(1)
    .all({ appId, audienceId })
    .at(0);
  if (!res) {
    return null;
  }

  const { meta, ...rest } = res;

  return { ...rest, ...meta };
}

export type CreateAudienceArgs = Omit<
  SelectAudienceDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectAudienceDB, "createdAt" | "updatedAt">> &
  SelectAudienceDB["meta"];

export function createAudience({
  appId,
  audienceId,
  name,
  description,
  createdAt,
  updatedAt,
  ...rest
}: CreateAudienceArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  if (!createdAt) {
    createdAt = updatedAt;
  }
  const res = db
    .insert(audienceTable)
    .values({
      appId,
      audienceId,
      name,
      description,
      createdAt,
      updatedAt,
      meta: rest,
    })
    .run();
  return res;
}

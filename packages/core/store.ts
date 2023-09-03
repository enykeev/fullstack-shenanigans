import { Database } from "bun:sqlite";
import { InferSelectModel, and, eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const { flagTable, audienceTable, overrideTable } = schema;

export const sqlite = new Database();
export const db = drizzle(sqlite, { schema });

type SelectFlagDB = InferSelectModel<typeof flagTable>;
type SelectAudienceDB = InferSelectModel<typeof audienceTable>;
type SelectOverrideDB = InferSelectModel<typeof overrideTable>;

export type InitArgs = {
  provisionMockData?: boolean;
};

export async function init({ provisionMockData = false }: InitArgs = {}) {
  migrate(db, { migrationsFolder: "migrations" });

  if (provisionMockData) {
    createFlag({
      appId: "some-app-id",
      flagId: "maintenance",
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
      flagId: "holiday-nl-1",
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
      flagId: "pricing-experiment-44",
      name: "Pricing experiment #44",
      description: "Another iteration of introductory pricing experiment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "boolean",
      value: false,
    });

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

    createOverride({
      appId: "some-app-id",
      overrideId: "maintenance-testers",
      flagId: "maintenance",
      audienceId: "testers",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "boolean",
      value: true,
    });
  }
}

export type ListFlagArgs = Pick<SelectFlagDB, "appId">;

export function listFlags({ appId }: ListFlagArgs) {
  const res = db.query.flagTable
    .findMany({
      where: eq(flagTable.appId, sql.placeholder("appId")),
      with: {
        overrides: {
          // NOTE: Out the box, drizzle has some problems handling json fields in relations so we're making them custom fileds instead.
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${flagTable.meta})`.as("meta"),
          },
          with: {
            audience: {
              columns: {
                meta: false,
              },
              extras: {
                meta: sql`json(${audienceTable.meta})`.as("meta"),
              },
            },
          },
        },
      },
    })
    .prepare()
    .all({ appId });

  return res.map((flag) => {
    const { meta, ...rest } = flag;
    return { ...rest, ...meta };
  });
}

export type GetFlagArgs = Pick<SelectFlagDB, "appId" | "flagId">;

export function getFlag({ appId, flagId }: GetFlagArgs) {
  const res = db.query.flagTable
    .findFirst({
      where: and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
      with: {
        overrides: {
          // NOTE: Out the box, drizzle has some problems handling json fields in relations so we're making them custom fileds instead.
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${flagTable.meta})`.as("meta"),
          },
          with: {
            audience: {
              columns: {
                meta: false,
              },
              extras: {
                meta: sql`json(${audienceTable.meta})`.as("meta"),
              },
            },
          },
        },
      },
    })
    .prepare()
    .all({ appId, flagId });

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
  return db
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

export function getFlagValue({ appId, flagId }: GetFlagValueArgs) {
  const flag = db.query.flagTable
    .findFirst({
      where: and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    })
    .prepare()
    .all({ appId, flagId });

  if (!flag) {
    return null;
  }
  return flag.meta;
}

export type SetFlagValueArgs = Pick<SelectFlagDB, "appId" | "flagId"> &
  SelectFlagDB["meta"];

export function setFlagValue({ appId, flagId, ...rest }: SetFlagValueArgs) {
  const flag = db.query.flagTable
    .findFirst({
      where: and(
        eq(flagTable.appId, sql.placeholder("appId")),
        eq(flagTable.flagId, sql.placeholder("flagId")),
      ),
    })
    .prepare()
    .all({ appId, flagId });
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

export function listAudiences({ appId }: ListAudiencesArgs) {
  const res = db.query.audienceTable
    .findMany({
      where: eq(audienceTable.appId, sql.placeholder("appId")),
      with: {
        overrides: {
          // NOTE: Out the box, drizzle has some problems handling json fields in relations so we're making them custom fileds instead.
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${audienceTable.meta})`.as("meta"),
          },
          with: {
            flag: {
              columns: {
                meta: false,
              },
              extras: {
                meta: sql`json(${flagTable.meta})`.as("meta"),
              },
            },
          },
        },
      },
    })
    .prepare()
    .all({ appId });

  return res.map((audience) => {
    const { meta, ...rest } = audience;
    return { ...rest, ...meta };
  });
}

export type GetAudienceArgs = Pick<SelectAudienceDB, "appId" | "audienceId">;

export function getAudience({ appId, audienceId }: GetAudienceArgs) {
  const res = db.query.audienceTable
    .findFirst({
      where: and(
        eq(audienceTable.appId, sql.placeholder("appId")),
        eq(audienceTable.audienceId, sql.placeholder("audienceId")),
      ),
      with: {
        overrides: {
          // NOTE: Out the box, drizzle has some problems handling json fields in relations so we're making them custom fileds instead.
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${audienceTable.meta})`.as("meta"),
          },
          with: {
            flag: {
              columns: {
                meta: false,
              },
              extras: {
                meta: sql`json(${flagTable.meta})`.as("meta"),
              },
            },
          },
        },
      },
    })
    .prepare()
    .all({ appId, audienceId });

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

export type UpdateAudienceArgs = Omit<
  SelectAudienceDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectAudienceDB, "updatedAt">> &
  SelectAudienceDB["meta"];

export function updateAudience({
  appId,
  audienceId,
  name,
  description,
  updatedAt,
  ...rest
}: UpdateAudienceArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  return db
    .update(audienceTable)
    .set({
      name,
      description,
      updatedAt,
      meta: rest,
    })
    .where(
      and(
        eq(audienceTable.appId, sql.placeholder("appId")),
        eq(audienceTable.audienceId, sql.placeholder("audienceId")),
      ),
    )
    .run({ appId, audienceId });
}

export type DeleteAudienceArgs = Pick<SelectAudienceDB, "appId" | "audienceId">;

export function deleteAudience({ appId, audienceId }: DeleteAudienceArgs) {
  return db
    .delete(audienceTable)
    .where(
      and(
        eq(audienceTable.appId, sql.placeholder("appId")),
        eq(audienceTable.audienceId, sql.placeholder("audienceId")),
      ),
    )
    .run({ appId, audienceId });
}

export type ListOverridesArgs = Pick<SelectOverrideDB, "appId">;

export function listOverrides({ appId }: ListOverridesArgs) {
  const res = db.query.overrideTable
    .findMany({
      where: eq(overrideTable.appId, sql.placeholder("appId")),
      with: {
        flag: {
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${overrideTable.meta})`.as("meta"),
          },
        },
        audience: {
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${overrideTable.meta})`.as("meta"),
          },
        },
      },
    })
    .prepare()
    .all({ appId });

  return res.map((override) => {
    const { meta, ...rest } = override;
    return { ...rest, ...meta };
  });
}

export type GetOverrideArgs = Pick<SelectOverrideDB, "appId" | "overrideId">;

export function getOverride({ appId, overrideId }: GetOverrideArgs) {
  const res = db.query.overrideTable
    .findFirst({
      where: and(
        eq(overrideTable.appId, sql.placeholder("appId")),
        eq(overrideTable.overrideId, sql.placeholder("overrideId")),
      ),
      with: {
        flag: {
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${overrideTable.meta})`.as("meta"),
          },
        },
        audience: {
          columns: {
            meta: false,
          },
          extras: {
            meta: sql`json(${overrideTable.meta})`.as("meta"),
          },
        },
      },
    })
    .prepare()
    .all({ appId, overrideId });

  if (!res) {
    return null;
  }

  const { meta, ...rest } = res;

  return { ...rest, ...meta };
}

export type CreateOverrideArgs = Omit<
  SelectOverrideDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectOverrideDB, "createdAt" | "updatedAt">> &
  SelectOverrideDB["meta"];

export function createOverride({
  appId,
  overrideId,
  flagId,
  audienceId,
  createdAt,
  updatedAt,
  ...rest
}: CreateOverrideArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  if (!createdAt) {
    createdAt = updatedAt;
  }

  return db
    .insert(overrideTable)
    .values({
      appId,
      flagId,
      audienceId,
      overrideId,
      createdAt,
      updatedAt,
      meta: rest,
    })
    .run();
}

export type UpdateOverrideArgs = Omit<
  SelectOverrideDB,
  "meta" | "createdAt" | "updatedAt"
> &
  Partial<Pick<SelectOverrideDB, "updatedAt">> &
  SelectOverrideDB["meta"];

export function updateOverride({
  appId,
  overrideId,
  flagId,
  audienceId,
  updatedAt,
  ...rest
}: UpdateOverrideArgs) {
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  return db
    .update(overrideTable)
    .set({
      flagId,
      audienceId,
      updatedAt,
      meta: rest,
    })
    .where(
      and(
        eq(overrideTable.appId, sql.placeholder("appId")),
        eq(overrideTable.overrideId, sql.placeholder("overrideId")),
      ),
    )
    .run({ appId, overrideId });
}

export type DeleteOverrideArgs = Pick<SelectOverrideDB, "appId" | "overrideId">;

export function deleteOverride({ appId, overrideId }: DeleteOverrideArgs) {
  return db
    .delete(overrideTable)
    .where(
      and(
        eq(overrideTable.appId, sql.placeholder("appId")),
        eq(overrideTable.overrideId, sql.placeholder("overrideId")),
      ),
    )
    .run({ appId, overrideId });
}

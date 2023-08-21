import { Flag } from "@feature-flag-service/common";
import { Database } from "bun:sqlite";

export const db = new Database();

export type FlagDB = {
  appId: string;
  flagId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  meta: string;
};

export class queries {
  static get listFlags() {
    return db.prepare<FlagDB, [FlagDB["appId"]]>(
      "SELECT * FROM flags where appId = ?",
    );
  }

  static get getFlag() {
    return db.prepare<FlagDB, [FlagDB["appId"], FlagDB["flagId"]]>(
      "SELECT * FROM flags where appId = ? and flagId = ?",
    );
  }

  static get createFlag() {
    return db.prepare<
      FlagDB,
      [
        FlagDB["appId"],
        FlagDB["flagId"],
        FlagDB["name"],
        FlagDB["description"],
        FlagDB["createdAt"],
        FlagDB["updatedAt"],
        FlagDB["meta"],
      ]
    >(
      "INSERT INTO flags (appId, flagId, name, description, createdAt, updatedAt, meta) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
  }

  static get updateFlag() {
    return db.prepare<
      FlagDB,
      [
        FlagDB["name"],
        FlagDB["description"],
        FlagDB["updatedAt"],
        FlagDB["meta"],
        FlagDB["appId"],
        FlagDB["flagId"],
      ]
    >(
      "UPDATE flags SET name = ?, description = ?, updatedAt = ?, meta = ? WHERE appId = ? and flagId = ?",
    );
  }

  static get deleteFlag() {
    return db.prepare<FlagDB, [FlagDB["appId"], FlagDB["flagId"]]>(
      "DELETE FROM flags WHERE appId = ? and flagId = ?",
    );
  }
}

export type InitArgs = {
  provisionMockData?: boolean;
};

export function init({ provisionMockData = false }: InitArgs = {}) {
  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      appId TEXT NOT NULL,
      flagId TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      meta TEXT NOT NULL,
      PRIMARY KEY (appId, flagId)
    )
  `);

  if (provisionMockData) {
    createFlag({
      appId: "some-app-id",
      flagId: "maintenance",
      name: "Maintenance",
      description:
        "Enable maintenance mode for the application, routing all affected traffic to a static page",
      createdAt: "2023-08-12T22:07:37.783Z",
      updatedAt: "2023-08-12T22:08:02.709Z",
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
      value: false,
    });

    createFlag({
      appId: "some-app-id",
      flagId: "pricing-experiment-44",
      name: "Pricing experiment #44",
      description: "Another iteration of introductory pricing experiment",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      value: false,
    });
  }
}

export type ListFlagArgs = Pick<FlagDB, "appId">;
export type ListFlagResult = Flag[];

export function listFlags({ appId }: ListFlagArgs): ListFlagResult {
  const res = queries.listFlags.all(appId).map((flag) => {
    const { meta, ...rest } = flag;
    return { ...rest, ...JSON.parse(meta) };
  });
  return res;
}

export type GetFlagArgs = Pick<FlagDB, "appId" | "flagId">;
export type GetFlagResult = Flag | null;

export function getFlag({ appId, flagId }: GetFlagArgs): GetFlagResult {
  const res = queries.getFlag.get(appId, flagId);
  if (!res) {
    return null;
  }

  const { meta = "{}", ...rest } = res;

  return { ...rest, ...JSON.parse(meta) };
}

export type CreateFlagArgs = Omit<FlagDB, "meta" | "createdAt" | "updatedAt"> &
  Partial<Pick<FlagDB, "createdAt" | "updatedAt">> &
  Record<string, unknown>;

export function createFlag({
  appId,
  flagId,
  name,
  description,
  createdAt,
  updatedAt,
  ...rest
}: CreateFlagArgs) {
  const meta = JSON.stringify(rest);
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  if (!createdAt) {
    createdAt = updatedAt;
  }
  const res = queries.createFlag.run(
    appId,
    flagId,
    name,
    description || null,
    createdAt,
    updatedAt,
    meta,
  );
  return res;
}

export type updateFlagArgs = Omit<FlagDB, "meta" | "createdAt" | "updatedAt"> &
  Partial<Pick<FlagDB, "updatedAt">> &
  Record<string, unknown>;

export function updateFlag({
  appId,
  flagId,
  name,
  description,
  updatedAt,
  ...rest
}: updateFlagArgs) {
  const meta = JSON.stringify(rest);
  if (!updatedAt) {
    updatedAt = new Date().toISOString();
  }
  return queries.updateFlag.run(
    name,
    description || null,
    updatedAt,
    meta,
    appId,
    flagId,
  );
}

export type DeleteFlagArgs = Pick<FlagDB, "appId" | "flagId">;

export function deleteFlag({ appId, flagId }: DeleteFlagArgs) {
  return queries.deleteFlag.run(appId, flagId);
}

export type GetFlagValueArgs = Pick<FlagDB, "appId" | "flagId">;
export type GetFlagValueResult = Record<string, unknown> | null;

export function getFlagValue({
  appId,
  flagId,
}: GetFlagValueArgs): GetFlagValueResult {
  const flag = queries.getFlag.get(appId, flagId);
  if (!flag) {
    return null;
  }
  return JSON.parse(flag.meta);
}

export type SetFlagValueArgs = Pick<FlagDB, "appId" | "flagId"> &
  Record<string, unknown>;

export function setFlagValue({
  appId,
  flagId,
  ...rest
}: SetFlagValueArgs): GetFlagValueResult {
  const flag = queries.getFlag.get(appId, flagId);
  if (!flag) {
    return null;
  }
  const meta = JSON.stringify(rest);
  const updatedAt = new Date().toISOString();
  queries.updateFlag.run(
    flag.name,
    flag.description,
    updatedAt,
    meta,
    appId,
    flagId,
  );
  return rest;
}

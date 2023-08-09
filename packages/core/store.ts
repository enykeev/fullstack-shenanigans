import { Database } from "bun:sqlite";

export const db = new Database();

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

export type FlagDB = {
  appId: string;
  flagId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  meta: string;
};

export const queries = {
  listFlags: db.prepare<FlagDB, [FlagDB["appId"]]>(
    "SELECT * FROM flags where appId = ?",
  ),
  getFlag: db.prepare<FlagDB, [FlagDB["appId"], FlagDB["flagId"]]>(
    "SELECT * FROM flags where appId = ? and flagId = ?",
  ),
  createFlag: db.prepare<
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
  ),
  updateFlag: db.prepare<
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
  ),
  deleteFlag: db.prepare<FlagDB, [FlagDB["appId"], FlagDB["flagId"]]>(
    "DELETE FROM flags WHERE appId = ? and flagId = ?",
  ),
};

export type Flag = Omit<FlagDB, "meta"> & Record<string, unknown>;

export type ListFlagArgs = Pick<FlagDB, "appId">;
export type ListFlagResult = Flag[];

export function listFlags({ appId }: ListFlagArgs): ListFlagResult {
  return queries.listFlags.all(appId).map((flag) => {
    const { meta, ...rest } = flag;
    return { ...rest, ...JSON.parse(meta) };
  });
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
  Record<string, unknown>;

export function createFlag({
  appId,
  flagId,
  name,
  description,
  ...rest
}: CreateFlagArgs) {
  const meta = JSON.stringify(rest);
  const updatedAt = new Date().toISOString();
  const createdAt = updatedAt;
  return queries.createFlag.run(
    appId,
    flagId,
    name,
    description || null,
    createdAt,
    updatedAt,
    meta,
  );
}

export type updateFlagArgs = Omit<FlagDB, "meta" | "createdAt" | "updatedAt"> &
  Record<string, unknown>;

export function updateFlag({
  appId,
  flagId,
  name,
  description,
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  ...rest
}: updateFlagArgs) {
  const meta = JSON.stringify(rest);
  const updatedAt = new Date().toISOString();
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

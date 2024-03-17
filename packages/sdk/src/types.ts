/**
 * Configuration object defining parameters for instantiating a client
 */
export type FeatureFlagClientConfig = {
  /**
   * URL of the feature flag service
   */
  endpoint: string;
  /**
   * Identifier for the application
   */
  appId: string;
  /**
   * Authentication token
   */
  token: string;
  /**
   * Optional fetcher function. Defaults to `fetch`.
   * @param input
   * @param init
   * @returns
   */
  fetcher?: typeof fetch;
};

export type Audience = {
  appId: string;
  audienceId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  filter: string;
};

export type BooleanOverride = {
  appId: string;
  overrideId: string;
  flagId: string;
  audienceId: string;
  audience: Audience;
  createdAt: string;
  updatedAt: string;
  type: "boolean";
  value: boolean;
};
export type StringOverride = {
  appId: string;
  overrideId: string;
  flagId: string;
  audienceId: string;
  audience: Audience;
  createdAt: string;
  updatedAt: string;
  type: "string";
  value: string;
};
export type NumberOverride = {
  appId: string;
  overrideId: string;
  flagId: string;
  audienceId: string;
  audience: Audience;
  createdAt: string;
  updatedAt: string;
  type: "number";
  value: number;
};
export type AnyOverride = BooleanOverride | StringOverride | NumberOverride;

export type BooleanFlag = {
  flagId: string;
  name: string;
  description?: string | null;
  overrides: BooleanOverride[];
  type: "boolean";
  value: boolean;
};
export type StringFlag = {
  flagId: string;
  name: string;
  description?: string | null;
  overrides: StringOverride[];
  type: "string";
  value: string;
};
export type NumberFlag = {
  flagId: string;
  name: string;
  description?: string | null;
  overrides: NumberOverride[];
  type: "number";
  value: number;
};
export type AnyFlag = BooleanFlag | StringFlag | NumberFlag;

export type GetFlagArgs = {
  flagId: string;
};

export type CreateBooleanFlagArgs = {
  flagId: string;
  name: string;
  description?: string | null;
  type: "boolean";
  value: boolean;
};
export type CreateStringFlagArgs = {
  flagId: string;
  name: string;
  description?: string | null;
  type: "string";
  value: string;
};
export type CreateNumberFlagArgs = {
  flagId: string;
  name: string;
  description?: string | null;
  type: "number";
  value: number;
};

export type UpdateBooleanFlagArgs = {
  flagId: string;
  name?: string;
  description?: string | null;
  type?: "boolean";
  value?: boolean;
};
export type UpdateStringFlagArgs = {
  flagId: string;
  name?: string;
  description?: string | null;
  type?: "string";
  value?: string;
};
export type UpdateNumberFlagArgs = {
  flagId: string;
  name?: string;
  description?: string | null;
  type?: "number";
  value?: number;
};

export type MatchFlagsArgs = {
  context: Record<string, unknown>;
  returns: "flags";
};
export type MatchOverridesArgs = {
  context: Record<string, unknown>;
  returns: "overrides";
};
export type MatchAudiencesArgs = {
  context: Record<string, unknown>;
  returns: "audiences";
};

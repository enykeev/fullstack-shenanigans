import {
  AllMetaTypes,
  Audience,
  Context,
  Flag,
  FlagWithOverrides,
  MatchRequest,
  Override,
  PostFlagBody,
  PutFlagBody,
} from "@feature-flag-service/common";
import { filterPredicate } from "1ql";

function makeClient({
  endpoint,
  token,
  fetcher,
}: {
  endpoint: string;
  token: string;
  fetcher: typeof fetch;
}) {
  return async function (path: string, opts: RequestInit = {}) {
    const res = await fetcher(`${endpoint}${path}`, {
      ...opts,
      headers: {
        ...opts.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status >= 400 && res.status < 500) {
      const message = (await res.json()).error;
      throw new Error(message);
    }
    return await res.json();
  };
}

export type FeatureFlagAPIArgs = {
  endpoint: string;
  appId: string;
  token: string;
  fetcher?: (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>;
};

export class FeatureFlagAPI {
  private appId: string;
  private client: (path: string, opts?: RequestInit) => Promise<unknown>;

  constructor({ endpoint, appId, token, fetcher = fetch }: FeatureFlagAPIArgs) {
    this.appId = appId;
    this.client = makeClient({ endpoint, token, fetcher });
  }

  async getFlags() {
    const res = await this.client("/api/flags");
    return res as FlagWithOverrides[];
  }

  async getFlag(flagId: Flag["flagId"]) {
    const res = await this.client(`/api/flags/${flagId}`);
    return res as FlagWithOverrides;
  }

  async createFlag(flag: PostFlagBody) {
    const res = await this.client(`/api/flags`, {
      method: "POST",
      body: JSON.stringify(flag),
    });
    return res as FlagWithOverrides;
  }

  async updateFlag(flag: PutFlagBody & { flagId: Flag["flagId"] }) {
    const res = await this.client(`/api/flags/${flag.flagId}`, {
      method: "PUT",
      body: JSON.stringify(flag),
    });
    return res as FlagWithOverrides;
  }

  async match(
    opts: MatchRequest & { returns: "overrides" },
  ): Promise<Override[]>;
  async match(
    opts: MatchRequest & { returns: "flags" },
  ): Promise<FlagWithOverrides[]>;
  async match(
    opts: MatchRequest & { returns: "audiences" },
  ): Promise<Audience[]>;
  async match(opts: MatchRequest) {
    const res = await this.client(`/api/match`, {
      method: "POST",
      body: JSON.stringify(opts),
    });
    switch (opts.returns) {
      case "overrides":
        return res;
      case "flags":
        return res;
      case "audiences":
        return res;
    }
  }
}

export type FeatureFlagServiceArgs = {
  endpoint: string;
  appId: string;
  token: string;
  pollingInterval?: number;
};

export type FeatureFlagListener = (
  err: Error | null,
  flags: FlagWithOverrides[],
) => void;

export class FeatureFlagService<T extends Context = object> {
  private client: FeatureFlagAPI;
  private pollingInterval: number | undefined;
  private pollingTimer: Timer | undefined;
  private abortController: AbortController | undefined;
  private flags: FlagWithOverrides[] = [];
  private listeners: FeatureFlagListener[] = [];
  constructor({
    endpoint,
    appId,
    token,
    pollingInterval,
  }: FeatureFlagServiceArgs) {
    this.client = new FeatureFlagAPI({ endpoint, appId, token });
    this.pollingInterval = pollingInterval;
  }
  async init() {
    await this.fetchFlags();
    if (this.pollingInterval) {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
      }
      this.pollingTimer = setInterval(() => {
        this.fetchFlags();
      }, this.pollingInterval);
    }
  }
  close() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  }
  async fetchFlags() {
    // We need to make sure we don't have more than one request in flight at a
    // time. This may cause a flood of calls if the service is to ever go down.
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    try {
      this.flags = await this.client.getFlags();
      this.listeners.forEach((listener) => listener(null, this.flags));
    } catch (e) {
      this.listeners.forEach((listener) => listener(e as Error, this.flags));
    }
  }
  addListener(listener: FeatureFlagListener) {
    this.listeners.push(listener);
  }
  removeListener(listener: FeatureFlagListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
  getFlags() {
    return this.flags;
  }
  getFlag(flagId: Flag["flagId"]) {
    return this.flags.find((f) => f.flagId === flagId);
  }
  getFlagValue(
    flagId: Flag["flagId"],
    {
      context,
      audienceId,
    }: { context?: T; audienceId?: Audience["audienceId"] } = {},
  ) {
    const flag = this.getFlag(flagId);
    if (!flag) {
      return undefined;
    }
    if (audienceId) {
      for (const override of flag.overrides) {
        if (override.audienceId === audienceId) {
          return {
            type: override.type,
            value: override.value,
          } as AllMetaTypes;
        }
      }
    }
    if (context) {
      for (const override of flag.overrides) {
        const audience = override.audience;
        if (audience && filterPredicate(audience.filter)(context)) {
          return {
            type: override.type,
            value: override.value,
          } as AllMetaTypes;
        }
      }
    }
    return {
      type: flag.type,
      value: flag.value,
    } as AllMetaTypes;
  }
  async getOverridesForContext(context: T) {
    return (await this.client.match({
      returns: "overrides",
      context,
    })) satisfies Override[];
  }
}

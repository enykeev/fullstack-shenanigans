import type {
  AllMetaTypes,
  Audience,
  Context,
  Flag,
  FlagWithOverrides,
  Override,
} from "@feature-flag-service/common";
import { filterPredicate } from "1ql";

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
  private endpoint: string;
  private appId: string;
  private token: string;
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
    this.endpoint = endpoint;
    this.appId = appId;
    this.token = token;
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
      const res = await fetch(`${this.endpoint}/api/flags`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        signal: this.abortController.signal,
      });
      this.flags = (await res.json()) as FlagWithOverrides[];
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
    const res = await fetch(`${this.endpoint}/api/match`, {
      method: "POST",
      body: JSON.stringify({
        returns: "overrides",
        context,
      }),
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return (await res.json()) as Override[];
  }
}

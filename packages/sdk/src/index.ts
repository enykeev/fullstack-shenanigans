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
};

export class FeatureFlagService<T extends Context = object> {
  private endpoint: string;
  private appId: string;
  private token: string;
  private flags: FlagWithOverrides[] = [];
  constructor({ endpoint, appId, token }: FeatureFlagServiceArgs) {
    this.endpoint = endpoint;
    this.appId = appId;
    this.token = token;
  }
  async init() {
    await this.fetchFlags();
  }
  async fetchFlags() {
    const res = await fetch(`${this.endpoint}/api/flags`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
    this.flags = (await res.json()) as FlagWithOverrides[];
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

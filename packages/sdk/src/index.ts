import type { Context, Flag } from "@feature-flag-service/common";

export type FeatureFlagServiceArgs = {
  endpoint: string;
  appId: string;
  token: string;
};

export class FeatureFlagService<T extends Context = object> {
  private endpoint: string;
  private appId: string;
  private token: string;
  private flags: Flag[] = [];
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
    this.flags = (await res.json()) as Flag[];
  }
  getFlags() {
    return this.flags;
  }
  getDefaultFlagValue(flagId: Flag["flagId"]) {
    const flag = this.flags.find((f) => f.flagId === flagId);
    if (!flag) {
      return undefined;
    }
    return {
      type: flag.type,
      value: flag.value,
    };
  }
  async getOverridesForContext(context: T) {
    const res = await fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify({
        returns: "overrides",
        context,
      }),
    });

    return res.json();
  }
}

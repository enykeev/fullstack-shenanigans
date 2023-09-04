import { SessionStore } from "./base";

const DEFAULT_EXPIRES = 60 * 60 * 24 * 7;

export class MemorySessionStore<T extends Record<string, unknown>>
  implements SessionStore
{
  private store: Record<
    string,
    {
      expires: number;
      data: T;
    }
  > = {};

  get(sid: string) {
    return this.store[sid];
  }

  set(sid: string, data: T, { expires }: { expires?: number } = {}) {
    this.store[sid] = {
      expires: expires ?? Date.now() + DEFAULT_EXPIRES,
      data,
    };
  }

  delete(sid: string) {
    delete this.store[sid];
  }

  clear() {
    this.store = {};
  }

  all() {
    return this.store;
  }

  length() {
    return Object.keys(this.store).length;
  }

  clearExpired() {
    const now = Date.now();
    for (const sid in this.store) {
      const expires = this.store[sid].expires;
      if (expires < now) {
        this.delete(sid);
      }
    }
  }
}

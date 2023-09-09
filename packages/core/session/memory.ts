import { SessionStore } from "./base";

const DEFAULT_SESSION_EXPIRATION = 60 * 60 * 24 * 7;

const globalStore: Record<string, { expires: number; data: unknown }> = {};

export class MemorySessionStore<T extends Record<string, unknown>>
  implements SessionStore<T>
{
  private expires: number;
  private store = globalStore as Record<string, { expires: number; data: T }>;

  constructor({ expires }: { expires?: number } = {}) {
    this.expires = expires ?? DEFAULT_SESSION_EXPIRATION;
  }

  get(sid: string) {
    return this.store[sid];
  }

  set(sid: string, data: T, { expires }: { expires?: number } = {}) {
    this.store[sid] = {
      expires: Date.now() + (expires ?? this.expires),
      data,
    };
  }

  delete(sid: string) {
    delete this.store[sid];
  }

  clear() {
    Object.keys(this.store).forEach((_, sid) => {
      delete this.store[sid];
    });
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

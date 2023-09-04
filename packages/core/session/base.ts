export type Session<T extends Record<string, unknown>> = {
  expires: number;
  data: T;
};

export interface SessionStore<T extends Record<string, unknown>> {
  get(sid: string): Session<T> | undefined;
  set(sid: string, data: T, options?: { expires?: number }): void;
  delete(sid: string): void;
  clear(): void;
  all(): Record<string, Session<T>>;
  length(): number;
  clearExpired(): void;
}

import pino, { LogFn, Logger } from "pino";

type LogSignature<T extends object> = (
  obj: T,
  msg?: string,
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => void;
type Hook = (
  this: Logger,
  args: Parameters<LogSignature<Record<string, unknown>>>,
  method: LogFn,
  level: number,
) => void;
const hooks: Hook[] = [];

export type StructuredLog = {
  logEvent: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const logMethod: (
  this: Logger,
  args: Parameters<LogFn>,
  method: LogFn,
  level: number,
) => void = function (args, method, level) {
  if (hooks.length === 0) {
    return method.apply(this, args);
  }
  for (const hook of hooks) {
    hook.call(
      this,
      args as unknown as Parameters<LogSignature<Record<string, unknown>>>,
      method,
      level,
    );
  }
};

export function addHook(hook: Hook) {
  hooks.push(hook);
}

export function removeHook(hook: Hook) {
  const index = hooks.indexOf(hook);
  if (index !== -1) {
    hooks.splice(index, 1);
  }
}

export function clearHooks() {
  hooks.length = 0;
}

export const logger = pino({ hooks: { logMethod } });

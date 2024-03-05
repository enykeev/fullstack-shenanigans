import { z } from "zod";

export const LogLine = z.object({
  logEvent: z.string(),
});

export type LogLine = {
  logEvent: string;
  msg?: string;
  [key: string]: unknown;
};

export class LogLinesStore {
  private logLines: LogLine[] = [];

  constructor(logLines: LogLine[] = []) {
    this.logLines = logLines;
  }

  add(obj: Record<string, unknown>, msg?: string) {
    const parsed = LogLine.passthrough().safeParse(obj);
    if (!parsed.success) {
      throw parsed.error;
    }
    const { logEvent, ...rest } = parsed.data;
    this.logLines.push({ ...rest, logEvent, msg });
  }

  filterType(logEvent: string) {
    return this.filter({ logEvent });
  }

  filter(obj: LogLine) {
    let lines = this.logLines;
    for (const key of Object.keys(obj)) {
      lines = lines.filter((e) => e[key] === obj[key]);
    }
    return new LogLinesStore(lines);
  }

  get(key: string) {
    return this.logLines.map((e) => e[key]);
  }

  clear() {
    this.logLines.length = 0;
  }
}

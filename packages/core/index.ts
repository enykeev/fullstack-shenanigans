/// <reference types="bun-types" />
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import pino from "pino";
import { serveStatic } from "./serveStatic";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { solidPlugin } from "esbuild-plugin-solid";

import api from "./routes/api";

const logger = pino();

await Bun.build({
  entrypoints: ["./packages/web/index.tsx"],
  outdir: "./dist",
  minify: false,
  plugins: [solidPlugin()],
});

const app = new Hono<{ Variables: Variables }>();

app.onError((e, c) => {
  if (e instanceof HTTPException) {
    return c.json({ error: e.message }, e.status);
  }
  return c.json({ error: e.message }, 500);
});

app.use(async (c, next) => {
  await next();

  const { req, res } = c;
  const { url, method } = req;
  const { status, headers } = res || {};

  logger.info(
    { url, method, status, headers },
    `${method} ${url} -> ${status}`,
  );
});

app.route("/api", api);

app.get("/404", () => {
  throw new HTTPException(404);
});

app.get("/version", (c) => {
  return c.text("1.0.0");
});

app.use(
  "*",
  serveStatic({ root: "./dist" }),
  serveStatic({ root: "./public" }),
  serveStatic({ path: "./public/index.html" }),
);

export default {
  port: 3000,
  fetch: app.fetch,
};

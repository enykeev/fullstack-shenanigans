/// <reference types="bun-types" />
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import pino from "pino";
import { serveStatic } from "./serveStatic";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { solidPlugin } from "esbuild-plugin-solid";

import flags from "./routes/flags";

const logger = pino();

const app = new Hono<{ Variables: Variables }>();

await Bun.build({
  entrypoints: ["./web/index.tsx"],
  outdir: "./dist",
  minify: false,
  plugins: [solidPlugin()],
});

app.use(async (c, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HTTPException) {
      return c.json({ error: e.message }, e.status);
    }
    throw e;
  }
});

app.use(async (c, next) => {
  const header = c.req.headers.get("Authorization");
  if (!header) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const [type, token] = header.split(" ");
  if (type !== "Bearer") {
    return c.json({ error: "unauthorized" }, 401);
  }

  if (token !== "secret") {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("X-App-Id", "some-app-id");

  await next();
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

app.route("/api/flags", flags);

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

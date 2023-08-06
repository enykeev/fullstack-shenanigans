/// <reference types="bun-types" />
import { HTTPException } from "hono/http-exception";
import { Hono } from "hono";
import pino from "pino";
import { serveStatic } from './serveStatic';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { solidPlugin } from 'esbuild-plugin-solid';

const logger = pino();

const app = new Hono();

await Bun.build({
  entrypoints: ["./web/index.tsx"],
  outdir: "./dist",
  minify: false,
  plugins: [solidPlugin()],
})

app.use(async (c, next) => {
  await next();

  const { req, res } = c;
  const { url, method } = req;
  const { status, headers } = res || {};

  logger.info({ url, method, status, headers}, `${method} ${url} -> ${status}`);
});

app.get('/404', () => {
  throw new HTTPException(404)
});

app.get('/version', c => {
  return c.text('1.0.0');
});

app.use('*', serveStatic({ root: './dist' }), serveStatic({ root: './public' }), serveStatic({ path: './public/index.html' }));

export default {
  port: 3000,
  fetch: app.fetch,
}
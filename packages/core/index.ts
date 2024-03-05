import { Serve } from "bun";

import { getApp } from "./app";
import { buildWeb } from "./build";
import env from "./env";
import { init } from "./store";

init({
  provisionMockData: env.PROVISION_MOCK_DATA,
});
await buildWeb();

export default {
  port: env.PORT || 3000,
  fetch: getApp(env).fetch,
} satisfies Serve;

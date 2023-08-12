import autoprefixer from "autoprefixer";
import * as esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import { sassPlugin } from "esbuild-sass-plugin";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";

import { logger } from "./logger";

// Bun.build clearly is not ready for prime time yet given that it does not support CSS loader.
// For now, we'll stick with esbuild and evaluate Bun.build later down the line.
export async function buildWeb() {
  const buildStartTime = Bun.nanoseconds();
  await esbuild.build({
    entryPoints: ["./packages/web/index.tsx"],
    outdir: "./dist",
    minify: false,
    bundle: true,
    sourcemap: "inline",
    plugins: [
      solidPlugin(),
      sassPlugin({
        async transform(source) {
          const { css } = await postcss([
            autoprefixer,
            postcssPresetEnv({ stage: 0 }),
          ]).process(source, { from: undefined });
          return css;
        },
      }),
    ],
  });
  const buildTimeNs = Bun.nanoseconds() - buildStartTime;
  logger.info(
    { logEvent: "buildTime", buildTimeNs },
    "Built web assets in %dms",
    Math.floor(buildTimeNs / 10 ** 6),
  );
}

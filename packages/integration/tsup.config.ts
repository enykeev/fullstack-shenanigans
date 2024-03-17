import type { BuildOptions } from "esbuild";
import { defineConfig, type Options } from "tsup";
import * as preset from "tsup-preset-solid";

const preset_options: preset.PresetOptions = {
  entries: [
    {
      entry: "src/index.ts",
    },
    {
      name: "react",
      entry: "src/react.tsx",
    },
  ],
  drop_console: true,
  cjs: false,
};

export default defineConfig((config) => {
  const watching = !!config.watch;

  const parsed_data = preset.parsePresetOptions(preset_options, watching);

  if (!watching) {
    const package_fields = preset.generatePackageExports(parsed_data);

    console.log(
      `\npackage.json: \n${JSON.stringify(package_fields, null, 2)}\n\n`,
    );
    preset.writePackageJson(package_fields);
  }

  const opts = preset.generateTsupOptions(parsed_data).map(
    (opt) =>
      ({
        ...opt,
        esbuildOptions: (es_options: BuildOptions) => ({
          ...es_options,
          jsx: "react-jsx",
        }),
        esbuildPlugins: [],
      }) as Options,
  );

  return opts;
});

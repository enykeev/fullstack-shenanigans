import { FeatureFlagClient } from "@feature-flag-service/sdk";
import cliui from "cliui";
import { Command } from "commander";
import ora from "ora";
import { z } from "zod";

type Column = {
  title: string;
  key: string;
};

type Row = {
  [key: string]: unknown;
};

function drawTable(cols: Column[], data: Row[]) {
  const ui = cliui({ width: 0 });
  const width =
    cols.reduce((acc, col) => Math.max(acc, col.title.length), 0) + 3;
  data.forEach((row, i) => {
    if (i > 0) {
      ui.div({
        text: "-".repeat(ui.width),
        width: ui.width,
        padding: [1, 0, 1, 0],
      });
    }
    cols.forEach((col) => {
      ui.div(
        { text: col.title, width, padding: [0, 1, 0, 0] },
        {
          text: row[col.key] === null ? "" : String(row[col.key]),
          padding: [0, 0, 0, 0],
        },
      );
    });
  });
  return ui.toString();
}

const FLAG_COLS = [
  { title: "Flag ID", key: "flagId" },
  { title: "Name", key: "name" },
  { title: "Description", key: "description" },
  { title: "Value", key: "value" },
  { title: "Type", key: "type" },
];

const program = new Command();

const booleanParamSchema = z
  .enum(["true", "false", "TRUE", "FALSE"])
  .transform((value) => value.toLowerCase() === "true");

program
  .name("ffs-cli")
  .description("CLI to Feature Flag service")
  .version("0.1.0");

program
  .command("list")
  .description("List all flags")
  .action(async () => {
    const client = new FeatureFlagClient({
      endpoint: "http://localhost:3000",
      appId: "some-app-id",
      token: "secret",
    });
    const flags = await client.getFlags();
    await Bun.write(Bun.stdout, drawTable(FLAG_COLS, flags) + "\n");
  });

program
  .command("get")
  .description("Get flag by ID")
  .argument("<flag>", "string to split")
  .action(async (flagName: string) => {
    const client = new FeatureFlagClient({
      endpoint: "http://localhost:3000",
      appId: "some-app-id",
      token: "secret",
    });
    const flag = await client.getFlag({ flagId: flagName });
    await Bun.write(Bun.stdout, drawTable(FLAG_COLS, [flag]) + "\n");
  });

const CreateOpts = z
  .object({
    name: z.string().optional(),
    description: z.string().nullable(),
    type: z.enum(["boolean", "number", "string"]),
    value: z.string(),
  })
  .transform((doc) => {
    const { type, value: potentialValue, ...rest } = doc;
    switch (type) {
      case "boolean": {
        const value = booleanParamSchema.parse(potentialValue);
        return { ...rest, type, value };
      }
      case "number": {
        const value = z.coerce.number().parse(potentialValue);
        return { ...rest, type, value };
      }
      case "string": {
        const value = z.string().parse(potentialValue);
        return { ...rest, type, value };
      }
    }
  });

program
  .command("create")
  .description("Create a new flag")
  .argument("<flag>", "string to split")
  .option("-n, --name <name>", "Name of the flag")
  .option("-d, --description <description>", "Description of the flag")
  .requiredOption("-v, --value <value>", "Value of the flag")
  .requiredOption("-t, --type <type>", "Type of the flag")
  .action(async (flagName: string, options: unknown) => {
    const { name, description, type, value } = CreateOpts.parse(options);
    const client = new FeatureFlagClient({
      endpoint: "http://localhost:3000",
      appId: "some-app-id",
      token: "secret",
    });
    let flag;
    switch (type) {
      case "boolean": {
        flag = await client.createFlag({
          flagId: flagName,
          name: name || flagName,
          description,
          type,
          value,
        });
        break;
      }
      case "string": {
        flag = await client.createFlag({
          flagId: flagName,
          name: name || flagName,
          description,
          type,
          value,
        });
        break;
      }
      case "number": {
        flag = await client.createFlag({
          flagId: flagName,
          name: name || flagName,
          description,
          type,
          value,
        });
        break;
      }
    }
    await Bun.write(Bun.stdout, drawTable(FLAG_COLS, [flag]) + "\n");
  });

const UpdateOpts = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    value: z.string().optional(),
    type: z.enum(["boolean", "number", "string"]).optional(),
  })
  .refine((doc) => {
    const { type, value } = doc;
    return (
      (type === undefined && value === undefined) ||
      (type !== undefined && value !== undefined)
    );
  }, "type and value need to be defined together")
  .transform((doc) => {
    const { type, value: potentialValue, ...rest } = doc;
    switch (type) {
      case "boolean": {
        const value = booleanParamSchema.parse(potentialValue);
        return { ...rest, type, value };
      }
      case "number": {
        const value = z.coerce.number().parse(potentialValue);
        return { ...rest, type, value };
      }
      case "string": {
        const value = z.string().parse(potentialValue);
        return { ...rest, type, value };
      }
      default: {
        return { ...rest, type: undefined, value: undefined };
      }
    }
  });

program
  .command("update")
  .description("Update flag")
  .argument("<flag>", "string to split")
  .option("-n, --name <name>", "Name of the flag")
  .option("-d, --description <description>", "Description of the flag")
  .option("-v, --value <value>", "Value of the flag")
  .option("-t, --type <type>", "Type of the flag")
  .action(async (flagName: string, options: unknown) => {
    const { name, description, type, value } = UpdateOpts.parse(options);
    const client = new FeatureFlagClient({
      endpoint: "http://localhost:3000",
      appId: "some-app-id",
      token: "secret",
    });
    try {
      let flag;
      switch (type) {
        case "boolean": {
          flag = await client.updateFlag({
            flagId: flagName,
            name,
            description,
            type,
            value,
          });
          break;
        }
        case "string": {
          flag = await client.updateFlag({
            flagId: flagName,
            name,
            description,
            type,
            value,
          });
          break;
        }
        case "number": {
          flag = await client.updateFlag({
            flagId: flagName,
            name,
            description,
            type,
            value,
          });
          break;
        }
        default: {
          flag = await client.updateFlag({
            flagId: flagName,
            name,
            description,
          });
        }
      }
      await Bun.write(Bun.stdout, drawTable(FLAG_COLS, [flag]) + "\n");
    } catch (e) {
      await Bun.write(Bun.stdout, `Error updating flag: ${e}\n`);
    }
  });

program
  .command("check")
  .description("Check value of a given flag")
  .argument("<flag>", "string to split")
  .action((flagName: string) => {
    const spinner = ora("Loading flag value...").start();

    setInterval(async () => {
      const res = await fetch(`http://localhost:3000/api/flags/${flagName}`, {
        headers: {
          Authorization: "Bearer secret",
        },
      });

      if (!res.ok) {
        spinner.color = "red";
        spinner.text = `Error loading flag value: ${await res.text()}`;
        return;
      }

      const flag: { value: string | boolean } = await res.json();

      spinner.color = "yellow";
      spinner.text = `Flag value: ${flag.value.toString()}`;
    }, 1000);
  });

program.parse();

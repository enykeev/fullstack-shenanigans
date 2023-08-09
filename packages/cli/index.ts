import { Command } from "commander";
import ora from "ora";
import { z } from "zod";

const program = new Command();

const booleanParamSchema = z
  .enum(["true", "false", "TRUE", "FALSE"])
  .transform((value) => value.toLowerCase() === "true");

program
  .name("ffs-cli")
  .description("CLI to Feature Flag service")
  .version("0.1.0");

const CreateOpts = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  value: z.union([booleanParamSchema, z.coerce.number(), z.string()]),
});

program
  .command("create")
  .description("Create a new flag")
  .argument("<flag>", "string to split")
  .option("-n, --name <name>", "Name of the flag")
  .option("-d, --description <description>", "Description of the flag")
  .requiredOption("-v, --value <value>", "Value of the flag")
  .action(async (flagName: string, options: unknown) => {
    const params = CreateOpts.parse(options);
    const res = await fetch(`http://localhost:3000/api/flags`, {
      method: "POST",
      headers: {
        Authorization: "Bearer secret",
      },
      body: JSON.stringify({
        flagId: flagName,
        name: flagName,
        ...params,
      }),
    });
    if (!res.ok) {
      await Bun.write(Bun.stdout, await res.text());
    }
  });

const UpdateOpts = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  value: z
    .union([booleanParamSchema, z.coerce.number(), z.string()])
    .optional(),
});

program
  .command("update")
  .description("Update flag")
  .argument("<flag>", "string to split")
  .option("-n, --name <name>", "Name of the flag")
  .option("-d, --description <description>", "Description of the flag")
  .option("-v, --value <value>", "Value of the flag")
  .action(async (flagName: string, options: unknown) => {
    const params = UpdateOpts.parse(options);
    const res = await fetch(`http://localhost:3000/api/flags/${flagName}`, {
      method: "PUT",
      headers: {
        Authorization: "Bearer secret",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      await Bun.write(Bun.stdout, await res.text());
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
      }).catch((e) => new Response(e.message, { status: 500 }));

      if (!res.ok) {
        spinner.color = "red";
        spinner.text = `Error loading flag value: ${await res.text()}`;
        return;
      }

      const flag = await res.json<{ value: string | boolean }>();

      spinner.color = "yellow";
      spinner.text = `Flag value: ${flag.value.toString()}`;
    }, 1000);
  });

program.parse();

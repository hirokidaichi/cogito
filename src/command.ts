import { z } from "./deps.ts";
import { settings } from "./settings.ts";
import { Func } from "./func.ts";
import { thinker } from "./thinker.ts";
import { compactForGoal } from "./chain.ts";

type HelpWay = "--help" | "subcommand" | "man";

export type CommandCreateOption<Input> = {
  description?: string;
  input: z.ZodType<Input>;
  help: HelpWay;
};
const _token = settings;

const helpByWay = async (commandPath: string, help: HelpWay) => {
  if (help === "--help") {
    return await doCommand(commandPath, ["--help"]);
  }
  if (help === "subcommand") {
    return await doCommand(commandPath, ["help"]);
  }
  if (help === "man") {
    return await doCommand("man", [commandPath]);
  }
};
const getHelp = async (commandPath: string, help: HelpWay) => {
  const result = await helpByWay(commandPath, help);
  if (!result || result.code !== 0) {
    const error = result?.stderr ?? "";
    throw new Error("help not found:" + error);
  }
  return result.stdout;
};

const CommandResponseSchema = z.object({
  code: z.number(),
  stdout: z.string(),
  stderr: z.string(),
});
type CommandResponse = z.infer<typeof CommandResponseSchema>;

const buffToString = (buf: Uint8Array) => new TextDecoder().decode(buf);

const commandSplit = (commandString: string) => {
  const args = commandString.split(" ");
  const command = args.shift() || commandString;
  return { command, rest: args };
};
const doCommand = async (commandPath: string, args: string[]) => {
  const { command, rest } = commandSplit(commandPath);
  const commandExecutor = new Deno.Command(command, {
    args: [...rest, ...args],
  });
  const { code, stdout, stderr } = await commandExecutor.output();
  const stdoutStr = buffToString(stdout);
  const stderrStr = buffToString(stderr);
  return {
    code,
    stdout: stdoutStr,
    stderr: stderrStr,
  };
};

const commandToFunctionName = (command: string) => {
  return command.replace(/-/g, "_") + "_command";
};

export class Command<Input> extends Func<Input, CommandResponse> {
  private helpText?: string;

  constructor(
    public command: string,
    public name: string,
    public description: string,
    public input: z.ZodType<Input>,
    public help: HelpWay,
  ) {
    const func = async (input: Input): Promise<CommandResponse> => {
      const args = await this.thinkCommandArguments(input);
      return await doCommand(this.command, args);
    };
    super(name, description, input, CommandResponseSchema, func);
  }
  async compactHelp() {
    if (this.helpText) {
      return this.helpText;
    }
    const helpText = await this.getHelp();
    if (helpText.length < settings.get("too_long_length")) {
      return helpText;
    }
    const input = JSON.stringify(this.parameters);
    const goal =
      ` Create command arguments according to the the input schema.\n INPUT SCHEMA: ${input}`;
    const shortHelp = await compactForGoal(goal, "HELP:" + helpText);
    this.helpText = shortHelp;
    return this.helpText;
  }
  async thinkCommandArguments(input: Input) {
    const helpText = await this.compactHelp();
    console.log(helpText);
    const optionThinker = thinker(this.name + "_option_thinker", {
      description:
        `Generate the ${this.command} command arguments according to the input data.
      If you want to execute the command "${this.command} -a -b 2", please return the array ["-a", "-b", "2"].
      Also, please read the help carefully and consider it.
    
      HELP: ${helpText}`,
      input: this.input,
      output: z.array(z.string()),
    });
    return await optionThinker.call(input);
  }

  async getHelp(): Promise<string> {
    return await getHelp(this.command, this.help);
  }
}

export const command = <Input>(
  command: string,
  options: CommandCreateOption<Input>,
) => {
  return new Command(
    command,
    commandToFunctionName(command),
    options.description ?? "",
    options.input,
    options.help,
  );
};

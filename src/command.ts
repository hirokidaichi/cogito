import { z } from "./deps.ts";
import { Func, func } from "./func.ts";

const CommandResponseSchema = z.object({
  code: z.number(),
  stdout: z.string(),
  stderr: z.string(),
});
type CommandResponse = z.infer<typeof CommandResponseSchema>;

const buffToString = (buf: Uint8Array) => new TextDecoder().decode(buf);

const doCommand = async (command: string, args: string[]) => {
  const commandExecutor = new Deno.Command(command, {
    args,
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

type ParsedResult = (string | { key: string })[];

function parseCommand(input: string): ParsedResult {
  const parts = input.split(/\s+/);
  const result: ParsedResult = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("{") && part.endsWith("}")) {
      result.push({ key: part.slice(1, -1) });
    } else {
      result.push(part);
    }
  }

  return result;
}

type ExtractKeys<S> = S extends `${infer _Start}{${infer Key}}${infer Rest}`
  ? Key | ExtractKeys<Rest>
  : never;

// キーを基にオブジェクトの型を生成
type ToObjectType<T extends string> = {
  [K in T]: string;
};

type CommandExprToType<Expr extends string> = ToObjectType<ExtractKeys<Expr>>;

function getParameters(parsed: ParsedResult) {
  return parsed.filter((p): p is { key: string } => typeof p === "object").map((
    p,
  ) => p.key);
}
function getSchema(parsed: ParsedResult) {
  const parameters = getParameters(parsed);

  const obj: { [key: string]: z.ZodString } = {};
  for (const key of parameters) {
    obj[key] = z.string();
  }
  return z.object(obj);
}

const command_auto = <CommandExpr extends string>(
  commandExpr: CommandExpr,
) => {
  type ReturnType = CommandExprToType<CommandExpr>;
  const parsed = parseCommand(commandExpr);
  const schema = getSchema(parsed);
  const name = parsed.at(0);

  const ret: Func<ReturnType, CommandResponse> = func(`command_${name}`, {
    description: `Execute Command: ${commandExpr}`,
    //@ts-ignore ここでは型が合わないが、実際には合う
    input: schema,
    output: CommandResponseSchema,
    callback: async (input: ReturnType) => {
      const [command, ...args] = parsed.map((p) =>
        //@ts-ignore ここでは型が合わないが、実際には合う
        typeof p === "object" ? input[p.key] : p
      );
      return await doCommand(command, args);
    },
  });
  return ret;
};

const command_manual = <Input>(
  commandExpr: string,
  options: { description?: string; input: z.ZodType<Input> },
) => {
  const parsed = parseCommand(commandExpr);
  const name = parsed.at(0);

  const ret: Func<Input, CommandResponse> = func(`command_${name}`, {
    description: `Execute Command: ${commandExpr}`,
    input: options.input,
    output: CommandResponseSchema,
    callback: async (input: Input) => {
      const [command, ...args] = parsed.map((p) =>
        //@ts-ignore ここでは型が合わないが、実際には合う
        typeof p === "object" ? String(input[p.key]) : p
      );
      return await doCommand(command, args);
    },
  });
  return ret;
};

export function command<CommandExpr extends string>(
  commandExpr: CommandExpr,
): Func<CommandExprToType<CommandExpr>, CommandResponse>;

export function command<Input>(
  commandExpr: string,
  options: { description?: string; input: z.ZodType<Input> },
): Func<Input, CommandResponse>;

// deno-lint-ignore no-explicit-any
export function command(...args: any[]) {
  if (args.length === 1) {
    return command_auto(args[0]);
  }
  if (args.length === 2) {
    return command_manual(args[0], args[1]);
  }
}

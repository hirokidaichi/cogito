import { z } from "npm:zod";
import { CallableCreateOption } from "./type.ts";
import { Func } from "./func.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { SandboxWorker } from "./sandboxworker.ts";
import { logger } from "./logger.ts";
import { memoizePersistent } from "./memoize.ts";
import { talker } from "./talker.ts";

function extractCode(input: string): string | null {
  const match = input.match(/```(?:javascript|typescript)([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

type ProgrammerOptions<
  Input,
  Output,
> = CallableCreateOption<Input, Output> & FunctionSetOption & {
  autoStop?: boolean;
};

const coding = talker("codeProgram", {
  description: `あなたは優秀なプログラマーです。
    ・{functions}で与えられた関数がすでに実装され使える状態です。再定義をしないでください。
    ・{define}で与えられた定義に従い、その関数を実装してください。
    外部関数のimportはできません。与えられた関数以外の関数が実装に必要な場合自分で実装をしてください。
    `,
  input: z.object({
    define: z.string(),
    functions: z.string(),
  }),
});

export class Programmer<Input, Output> extends Func<Input, Output> {
  public sandbox?: SandboxWorker;
  constructor(
    public name: string,
    public description: string,
    public input: z.ZodType<Input>,
    public output: z.ZodType<Output>,
    public functions: FunctionSet = new FunctionSet(),
    public autoStop: boolean = true,
  ) {
    super(
      name,
      description,
      input,
      output,
      async (input: Input): Promise<Output> => {
        const sandbox = await this.compile();
        // deno-lint-ignore no-explicit-any
        const res = await sandbox.call(input) as any as Output;
        if (this.autoStop) sandbox.terminate();
        return res;
      },
    );
  }

  public async code() {
    const define = this.asTypeScript();
    const functions = this.functions.asTypeScript();
    const result = await coding.call({
      define,
      functions,
    });
    const code = extractCode(result);
    return code;
  }
  public async compile() {
    if (this.sandbox) return this.sandbox;

    const code = await this.code() || "";
    logger.log({
      level: "debug",
      name: this.name,
      type: "code",
      code,
    });

    const sandbox = SandboxWorker.create(this.name, {
      code,
      functions: this.functions,
    });
    await sandbox.start();
    if (!this.autoStop) {
      this.sandbox = sandbox;
    }
    return sandbox;
  }
  public terminate() {
    if (this.sandbox) {
      this.sandbox.terminate();
    }
  }
}

export const programmer = <Input, Output>(
  name: string,
  options: ProgrammerOptions<Input, Output>,
) => {
  const functions = options.functions ?? new FunctionSet();
  const functionSet = (functions instanceof FunctionSet)
    ? functions
    : FunctionSet.create(functions);

  return new Programmer(
    name,
    options.description,
    options.input,
    options.output,
    functionSet,
    options.autoStop ?? true,
  );
};

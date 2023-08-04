import { IStore, MemoryStore } from "./cache.ts";
import { z } from "npm:zod";
import { CallableCreateOption } from "./type.ts";
import { Func } from "./func.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { SandboxWorker } from "./sandboxworker.ts";
import { logger } from "./logger.ts";
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

const fixCode = talker("fixCode", {
  description:
    `あなたは優秀なプログラマーです。エラーを読んで修正してください。`,
  input: z.object({
    code: z.string(),
    error: z.string(),
  }),
});

const compileSandbox = async (
  name: string,
  code: string,
  functions: FunctionSet,
): Promise<SandboxWorker> => {
  const sandbox = SandboxWorker.create(name, {
    code,
    functions,
  });
  try {
    await sandbox.start();
    return sandbox;
  } catch (e) {
    logger.warn("compile error:", e);
    const error = e.message;
    const fix = await fixCode.call({
      code,
      error,
    });
    return await compileSandbox(name, extractCode(fix) || "", functions);
  }
};

export class Programmer<Input, Output> extends Func<Input, Output> {
  public sandbox?: SandboxWorker;
  private executableCode?: string;
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
    if (this.executableCode) return this.executableCode;
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

    const sandbox = await compileSandbox(this.name, code, this.functions);

    if (sandbox.isRunning()) {
      this.executableCode = sandbox.code;
    }

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

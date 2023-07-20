import { z } from "npm:zod";
import { CallableCreateOption } from "./type.ts";
import { Func } from "./func.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { SandboxWorker } from "./sandboxworker.ts";
import { Agent } from "./agent.ts";
import { logger } from "./logger.ts";
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
    const def = this.functions.asTypeScript();
    const thinkerDef = this.asTypeScript();
    const agent = Agent.create();
    agent.addSystemMessage(
      "あなたは優秀なプログラマーです。以下の定義の関数がすでに実装され使える状態です。ユーザーの指示に従ってTypeScriptを生成してください。外部関数のimportはできません。与えられた関数以外の関数が実装に必要な場合自分で実装をしてください。",
    );
    agent.addSystemMessage(`${def}`);
    const res = await agent.chat(`次の関数を実装してください：${thinkerDef}`);
    const code = extractCode(res?.content || "");
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

  static create<Input, Output>(
    name: string,
    options: ProgrammerOptions<Input, Output>,
  ) {
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
  }
}

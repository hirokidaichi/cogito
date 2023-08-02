import { z } from "./deps.ts";
import { CallableCreateOption } from "./type.ts";
import { Func } from "./func.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { Agent } from "./agent.ts";
import { AgentExecutorWithResult } from "./agent_executor_with_result.ts";

type ThinkerOptions<
  Input,
  Output,
> = CallableCreateOption<Input, Output> & FunctionSetOption;

export class Thinker<Input, Output> extends Func<Input, Output> {
  public static readonly PROMPT =
    "あなたの仕事は次の関数定義に従って、もっともらしい出力を生成することです。名前と説明は、あなたが出力を生成するために使用することができるものです。";
  constructor(
    public name: string,
    public description: string,
    public input: z.ZodType<Input>,
    public output: z.ZodType<Output>,
    public functions: FunctionSet = new FunctionSet(),
  ) {
    const func = async (input: Input): Promise<Output> => {
      const agent = Agent.create({
        functions: this.functions,
      });

      const prompt = `${Thinker.PROMPT}\n${this.asTypeScript()}\n\n${name}(${
        JSON.stringify(input)
      })`;

      const executor = new AgentExecutorWithResult(agent, prompt, output);
      return await executor.output();
    };
    super(name, description, input, output, func);
  }
}

export const thinker = <Input, Output>(
  name: string,
  options: ThinkerOptions<Input, Output>,
) => {
  const functionSet = FunctionSet.create(options.functions);

  return new Thinker(
    name,
    options.description,
    options.input,
    options.output,
    functionSet,
  );
};

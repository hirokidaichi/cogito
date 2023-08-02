import { z } from "./deps.ts";
import { Func } from "./func.ts";
import { FunctionSet, FunctionSetOption } from "./functionset.ts";
import { Agent } from "./agent.ts";
import { AgentExecutor } from "./agent_executor.ts";

type TalkerOptions<
  Input,
> = {
  description: string;
  input: z.ZodType<Input>;
} & FunctionSetOption;

export class Talker<Input> extends Func<Input, string> {
  constructor(
    public name: string,
    public description: string,
    public input: z.ZodType<Input>,
    public functions: FunctionSet = new FunctionSet(),
  ) {
    const func = async (input: Input): Promise<string> => {
      const agent = Agent.create({
        functions: this.functions,
      });
      const prompt = `名前:${this.name}\n\n指示:${this.description}\n\n 入力:${
        JSON.stringify(input)
      }`;

      const executor = new AgentExecutor(agent, prompt);
      return await executor.exec() || "";
    };
    super(name, description, input, z.string(), func);
  }
}

export const talker = <Input>(
  name: string,
  options: TalkerOptions<Input>,
) => {
  const functionSet = FunctionSet.create(options.functions);

  return new Talker(
    name,
    options.description,
    options.input,
    functionSet,
  );
};

import { z } from "npm:zod";

export type CallableCreateOption<Input, Output> = {
  description: string;
  input: z.ZodType<Input>;
  output: z.ZodType<Output>;
};

export type FunctionCallback<
  Input,
  Output,
> =
  | ((args: Input) => Promise<Output>)
  | ((args: Input) => Output);

export interface IFunction<Input, Output> {
  name: string;
  description: string;
  input: z.ZodType<Input>;
  output: z.ZodType<Output>;
  // deno-lint-ignore no-explicit-any
  asObject(): { name: string; description: string; parameters: any }; // Again, you might want to refine the type of `parameters`.
  asTypeScript(imp?: string): string;
  toFunction(): (input: Input) => Promise<Output>;
  exec(arg: string): Promise<Output>;
  call(arg: Input): Promise<Output>;
}
  // deno-lint-ignore no-explicit-any
export type IFunctionAny = IFunction<any, any>;
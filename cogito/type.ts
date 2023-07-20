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

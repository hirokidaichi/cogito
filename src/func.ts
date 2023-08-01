import {
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage,
  printNode,
  z,
  zodToJsonSchema,
  zodToTs,
} from "./deps.ts";

import { CallableCreateOption } from "./type.ts";

import { logger } from "./logger.ts";
const functionMessage = (name: string, content: string) => ({
  name,
  role: ChatCompletionRequestMessageRoleEnum.Function,
  content,
});

export type FuncCallback<
  Input,
  Output,
> =
  | ((args: Input) => Promise<Output>)
  | ((args: Input) => Output);

type FuncOptions<
  Input,
  Output,
> = CallableCreateOption<Input, Output> & {
  callback: FuncCallback<Input, Output>;
};

const zodToTypeScript = (schema: z.ZodTypeAny, name: string) => {
  const { node } = zodToTs(schema, name);
  return printNode(node);
};

export class Func<Input, Output> {
  constructor(
    public name: string,
    public description: string,
    public input: z.ZodType<Input>,
    public output: z.ZodType<Output>,
    public callback: FuncCallback<Input, Output>,
  ) {}
  get parameters() {
    return zodToJsonSchema(z.object({ input: this.input }), "schema")
      .definitions?.schema;
  }
  public asObject() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }
  public asTypeScript(imp?: string) {
    const inputType = zodToTypeScript(this.input, "Input");
    const outputType = zodToTypeScript(this.output, "Output");
    return `async function ${this.name}(input:${inputType}):Promise<${outputType}>{\n// ${this.description}\n${
      imp || ""
    }\n}`;
  }
  public toFunction() {
    return async (input: Input): Promise<Output> => {
      return await this.call(input);
    };
  }
  public async execToMessage(
    argumentsString: string,
  ): Promise<ChatCompletionResponseMessage> {
    const result = this.exec(argumentsString);
    return await functionMessage(this.name, JSON.stringify(result));
  }
  public async exec(arg: string) {
    const obj = JSON.parse(arg);
    const parsedObject = this.input.parse(obj.input);
    return await this.call(parsedObject);
  }
  public async call(arg: Input) {
    logger.log({
      level: "info",
      type: "request",
      name: this.name,
      input: arg,
    });

    const result = this.callback(arg);
    const realResult = (result instanceof Promise) ? await result : result;
    logger.log({
      level: "info",
      type: "response",
      name: this.name,
      input: arg,
      output: realResult,
    });
    return realResult;
  }
}
// deno-lint-ignore no-explicit-any
export type FuncAny = Func<any, any>;
export const func = <Input, Output>(
  name: string,
  options: FuncOptions<Input, Output>,
) => {
  return new Func(
    name,
    options.description,
    options.input,
    options.output,
    options.callback,
  );
};

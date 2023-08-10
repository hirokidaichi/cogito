import { cogito, z } from "../core.ts";

interface Tool {
  call(arg: string): Promise<string>;

  name: string;

  description: string;
}

export const tool = (tool: Tool) => {
  return cogito.func(tool.name, {
    description: tool.description,
    input: z.string(),
    output: z.string(),
    callback: async (input: string) => {
      return await tool.call(input);
    },
  });
};

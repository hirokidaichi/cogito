import { cogito, z } from "../mod.ts";

const readFile = cogito.func("readFile", {
  description: "read file",
  input: z.object({ path: z.string() }),
  output: z.string(),
  callback: async ({ path }) => {
    return await Deno.readTextFile(path);
  },
});

const explainFile = cogito.thinker(
  "explainFile",
  {
    description: "与えられたPathのファイルの説明文をつくれ",
    input: z.string(),
    output: z.object({
      path: z.string(),
      summary: z.string().describe("一行で端的に説明する"),
    }),
    functions: [readFile],
  },
);

const result = await explainFile.call("./cogito/agent.ts");

console.log(result);

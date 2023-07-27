import { cogito, z } from "../mod.ts";

const explainFile = cogito.thinker(
  "explainFile",
  {
    description: "与えられたPathのファイルの説明文をつくれ",
    input: z.string(),
    output: z.object({
      path: z.string(),
      summary: z.string().describe("一行で端的に説明する"),
    }),
    functions: [cogito.textfile.read],
  },
);
const result = await explainFile.call(
  "./example/example-functionset-search.ts",
);

console.log(result);

const saveExplain = cogito.thinker("saveExplain", {
  description:
    "targetPathのファイルを読み、簡潔なmarkdown形式のドキュメントをつくり、それをexplainPathのファイルを新たに作り保存する。",
  input: z.object({
    targetPath: z.string(),
    explainPath: z.string(),
  }),
  output: z.enum(["success", "failure"]),
  functions: [cogito.textfile.create, cogito.textfile.read],
});

const result2 = await saveExplain.call({
  targetPath: "./src/functionset.ts",
  explainPath: "./docs/functionset.md",
});

console.log(result2);

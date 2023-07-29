import { cogito, z } from "../mod.ts";

const textfile = cogito.textfile();

const insertDocument = cogito.thinker("insert_document", {
  description:
    "与えられたパスのファイルを読んで、与えられた関数に関する説明を考え、日本語のコメントを追加しなさい。",
  input: z.object({
    path: z.string(),
    functionName: z.string(),
  }),
  output: z.enum(["success", "failure"]),
  functions: [textfile.read, textfile.insert],
});

const result = await insertDocument.call({
  path: "src/agent.ts",
  functionName: "addLineNumbers",
});

//console.log(cogito.textfile.dryrun.list());

import { cogito, z } from "../mod.ts";

const textfile = cogito.textfile;

const insertDocument = cogito.thinker("insert_document", {
  description:
    "与えられたパスのソースコードが行っていることの説明を箇条書きでリストとして出力する。",
  input: z.object({
    path: z.string(),
  }),
  output: z.array(z.string()),
  functions: [textfile.read],
});

const result = await insertDocument.call({
  path: "src/textfile.ts",
});
console.log(JSON.stringify(result));

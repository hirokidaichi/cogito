import { cogito, z } from "../mod.ts";

const lizard = cogito.command("lizard -w {path}", {
  description: "複雑なコードを発見して警告する。",
  input: z.object({
    path: z.string().describe("targetPath"),
  }),
});

const ComplexFunction = z.object({
  filePath: z.string().describe("与えられたtargetPathからの相対path"),
  function: z.string(),
  ccn: z.number(),
  nloc: z.number(),
});

const alert = cogito.thinker("codeAlert", {
  description:
    "与えられたpathにあるコードの複雑度を調べて、フォーマットを整えて返す。複雑な関数がなければ空配列を返す。",
  input: z.object({
    path: z.string(),
  }),
  output: z.array(ComplexFunction),
  functions: [lizard],
});
console.log(await alert.call({ path: "./" }));

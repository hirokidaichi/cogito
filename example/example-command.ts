import { cogito, z } from "../mod.ts";

const tree = cogito.command("tree", {
  description: "ディレクトリのツリーを表示します",
  input: z.object({
    path: z.string(),
    ignore: z.array(z.string()),
    extensions: z.array(z.string()),
  }),
  help: "--help",
});

const res = await tree.call({
  path: "./",
  ignore: ["node_modules"],
  extensions: [".ts", ".js"],
});
console.log(res.stdout);
/*
const codeExplain = cogito.thinker("code-explain", {
  description:
    "与えられたpath配下にあるtsファイルを読んで概要を短く教えてください。.ただし、node_modulesを対象から外すこと。",
  input: z.object({
    path: z.string(),
  }),
  output: z.string().describe("短い説明文"),
  functions: [tree],
});

const res2 = await codeExplain.call({
  path: "./",
});
console.log(res2);
*/

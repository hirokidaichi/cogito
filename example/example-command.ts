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

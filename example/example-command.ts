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

const gitadd = cogito.command("git add", {
  description: "git add",
  input: z.object({
    path: z.string(),
  }),
  help: "--help",
});

const res2 = await gitadd.call({
  path: ".",
});
console.log(res2.stdout);

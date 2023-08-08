import { cogito, z } from "../mod.ts";

const tree = cogito.command("tree {path} -P {extensions}");

const res = await tree.call({
  path: "./",
  extensions: "*.js",
});
console.log(res.stdout);

const tree2 = cogito.command("tree {path} -P {extensions}", {
  description: "tree",
  input: z.object({
    path: z.string(),
    extensions: z.string().describe("extensions like '*.ts|*.js'"),
  }),
});

const res2 = await tree2.call({
  path: "./",
  extensions: "*.ts",
});
console.log(res2.stdout);

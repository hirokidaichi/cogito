import { cogito, z } from "../cogito/mod.ts";

const ps = cogito.command("ps", {
  description: "プロセスを表示します",
  input: z.object({
    username: z.string().describe(
      "与えられたユーザー名のプロセスのみを表示する。",
    ),
    onlyProcessId: z.boolean().describe("プロセスIDのみを表示"),
  }),
  help: "man",
});

const res = await ps.call({
  username: "hirokidaichi",
  onlyProcessId: true,
});
console.log(res.stdout);

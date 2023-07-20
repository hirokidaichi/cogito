import { cogito, z } from "../cogito/mod.ts";

const javascript = cogito.func("javascript", {
  description: "Evaluate javascript expression",
  input: z.object({ expression: z.string() }),
  output: z.any(),
  callback: ({ expression }) => {
    return eval(expression);
  },
});

const student = cogito.thinker("student", {
  description: "与えられた算数の問題を解く",
  input: z.string().describe("算数の問題"),
  output: z.object({
    answer: z.number().describe("答え"),
    description: z.string().describe("解説"),
  }),
  functions: [javascript],
});

const result = await student.call(`
ある果物屋さんでは、りんごを1個100円、みかんを1個50円で売っています。今日、佐藤さんはりんごとみかんを合わせて12個買い、合計で850円支払いました。佐藤さんがりんごとみかんをそれぞれ何個ずつ買ったか求めてください。
`);

console.log(result);

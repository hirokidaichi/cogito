import { cogito, z } from "../mod.ts";

const javascript = cogito.func("matheval", {
  description:
    "Evaluate simple mathematics expression( like 1+1 or 2*3*(1+2)  )",
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

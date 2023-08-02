import { cogito, z } from "../mod.ts";
cogito.logger.verbose = false;

import { readLines } from "https://deno.land/std@0.196.0/io/mod.ts";

const readOneLine = async () => {
  for await (const line of readLines(Deno.stdin)) {
    return line;
  }
};
const userPrompt = async (question: string) => {
  console.log(`? ${question} >`);
  return await readOneLine();
};

const ask = cogito.func("ask", {
  description: "ユーザーに対して質問を行う",
  input: z.object({ question: z.string() }),
  output: z.string(),
  callback: async ({ question }) => {
    return await userPrompt(question);
  },
});

const interview = cogito.talker("interview", {
  description:
    `あなたは優れたインタビューアーです。相手とアイスブレイクも交えながら、次の事柄を知るために順次インタビューを繰り返し、その上で紹介文を作成してください。必要があれば、掘り下げて追加で質問もしてください。`,
  input: z.array(z.string()),
  functions: [ask],
});

const result = await interview.call([
  "経歴",
  "野望",
  "最近の趣味",
  "悩み",
]);

console.log(result);

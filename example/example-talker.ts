import { cogito, z } from "../mod.ts";
cogito.logger.verbose = false;
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.2/prompt/mod.ts";

const askHuman = cogito.func("ask-human", {
  description: "when you have a question, ask the user.",
  input: z.object({ question: z.string() }),
  output: z.string(),
  callback: async ({ question }) => {
    return await Input.prompt(question);
  },
});

const interview = cogito.talker("interview", {
  description:
    `あなたは優れたインタビューアーです。相手とアイスブレイクも交えながら、次の事柄についてインタビューを繰り返し、その上で紹介文を作成してください。必要があれば、掘り下げて追加で質問もしてください。`,
  input: z.array(z.string()),
  functions: [askHuman],
});

const result = await interview.call([
  "経歴",
  "野望",
  "最近の趣味",
  "悩み",
]);

console.log(result);

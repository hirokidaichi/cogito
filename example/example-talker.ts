import { cogito, z } from "../mod.ts";
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
    "入力された項目について知るために、インタビューを行なってプロフィール文章を作ってください。",
  input: z.array(z.string()),
  functions: [askHuman],
});

const result = await interview.call([
  "今まで一番おどろいたこと",
  "最近の趣味",
  "なぜプログラミングを始めたのか",
]);

console.log(result);

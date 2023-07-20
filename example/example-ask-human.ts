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

const generateProfile = cogito.thinker("generateProfile", {
  description:
    "与えられた人物のプロフィールを作成してください。ただし、わからない項目は質問してください。",
  input: z.object({ name: z.string() }),
  output: z.object({
    name: z.string(),
    age: z.number(),
    hobby: z.string(),
    family: z.string().describe("家族構成"),
  }),
  functions: [askHuman],
});

const result = await generateProfile.call({ name: "広木大地" });

console.log(result);

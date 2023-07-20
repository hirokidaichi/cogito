import { cogito, z } from "../cogito/mod.ts";

const listIdeaSeed = cogito.thinker("listIdeaSeed", {
  description:
    "与えられたテーマに沿って、n個のビジネスアイデアの種を列挙する。",
  input: z.object({ theme: z.string(), n: z.number() }),
  output: z.array(z.string()),
});

const IdeaType = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.string(),
});

const blushupIdea = cogito.thinker("blushupIdea", {
  description:
    "与えられたビジネスアイデアの種を、より具体的なアイデアにブラッシュアップする。",
  input: z.object({ idea: z.string() }),
  output: IdeaType,
});

const mixIdea = cogito.thinker("mixIdea", {
  description: "二つのアイデアをミックスして新しいアイデアを創出する。",
  input: z.object({
    ideaA: z.string(),
    ideaB: z.string(),
  }),
  output: z.object({ idea: z.string() }),
});

const generateIdea = cogito.thinker("generateIdea", {
  description:
    "複数のアイデアの種をランダムに混ぜて、新しいアイデアを創出する。その結果をブラッシュアップして出力する。",
  input: z.object({ theme: z.string() }),
  output: IdeaType,
  functions: [listIdeaSeed, blushupIdea, mixIdea],
});

const result = await generateIdea.call({ theme: "カレーの新業態" });
console.log(JSON.stringify(result));

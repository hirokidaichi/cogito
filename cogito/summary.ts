
/*
import { thinker } from "./thinker.ts";
import { func } from "./func.ts";
import { TokenTextSplitter, z } from "./deps.ts";

const TEXT = Deno.readTextFileSync("./man-ls.txt");
const GOAL = "lsコマンドでできることを知りたい";

const splitter = new TokenTextSplitter({
  encodingName: "gpt2",
  chunkSize: 3000,
  chunkOverlap: 100,
  allowedSpecial: ["<|endoftext|>"],
  disallowedSpecial: [],
});

const output = await splitter.createDocuments([TEXT]);
console.log({ output });

const SummaryInputSchema = z.object({
  goal: z.string(),
  text: z.string(),
  max: z.number().default(100),
});

type SummaryInput = z.infer<typeof SummaryInputSchema>;

export const summary = thinker("summary", {
  description:
    "Summarize into a brief statement(under {max} characters), specifically retaining only the relevant sections necessary to achieve the goal.",
  input: SummaryInputSchema,
  output: z.string(),
});

const splitChunkByLines = (text: string, maxLine = 100) => {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (current.length > maxLine) {
      chunks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) {
    chunks.push(current.join("\n"));
  }

  return chunks;
};

/*
export const splitSummary = func("splitSummary", {
  description: "Split the summary into sentences.",
  input: SummaryInputSchema,
  output: z.string(),
  callback: async ({ goal, text }) => {
    const chunks = splitChunkByLines(text, 10);
    console.log(chunks.length);

    const promises = chunks.map((chunk) =>
      summary.call({ goal: goal, text: chunk })
    );
    const result = await Promise.all(promises);
    return result.join("\n");
  },
});

const res = await splitSummary.call({ goal: GOAL, text: TEXT, max: 150 });
console.log(res);*/
*/
import {
  ChatOpenAI,
  Document,
  loadQARefineChain,
  TokenTextSplitter,
} from "./deps.ts";

import { settings } from "./settings.ts";

const getDefaultModel = () =>
  new ChatOpenAI({
    modelName: settings.get("reading_model"),
    temperature: settings.get("temperature"),
    verbose: false,
  });

const getDefaultSplitter = () =>
  new TokenTextSplitter({
    chunkSize: settings.get("reading_chunk_size"),
    chunkOverlap: settings.get("reading_chunk_overlap"),
  });

export const compactForGoal = async (goal: string, longText: string) => {
  const model = getDefaultModel();
  const splitter = getDefaultSplitter();

  const doc = new Document({ pageContent: longText });
  const docs = await splitter.splitDocuments([doc]);
  console.log(goal);
  const chain = loadQARefineChain(model);
  const prompt =
    `Extract the necessary information to achieve the goal.\nGoal: ${goal}`;
  const response = await chain.call({
    question: prompt,
    input_documents: docs,
  });
  return response.output_text;
};

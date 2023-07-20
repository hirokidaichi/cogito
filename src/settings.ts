import { z } from "./deps.ts";

const GlobalSettingsSchema = z.object({
  language: z.union([z.literal("japanese"), z.literal("english")]).default(
    "japanese",
  ),
  agent_retry_count: z.number().default(3),

  model: z.string().default("gpt-4-0613"),
  reading_model: z.string().default("gpt-4-0613"),
  reading_chunk_size: z.number().default(5000),
  reading_chunk_overlap: z.number().default(500),
  too_long_length: z.number().default(10000),
  tokenizer: z.string().default("gpt2"),
  chunk_size: z.number().default(2048),
  chunk_overlap: z.number().default(100),
  temperature: z.number().default(0),
});

type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

const GLOBAL_SETTINGS = GlobalSettingsSchema.parse({});

const set = <K extends keyof GlobalSettings>(
  key: K,
  value: GlobalSettings[K],
) => {
  GLOBAL_SETTINGS[key] = value;
  GlobalSettingsSchema.parse(GLOBAL_SETTINGS);
};

const get = <K extends keyof GlobalSettings>(key: K): GlobalSettings[K] => {
  return GLOBAL_SETTINGS[key];
};
export const settings = {
  set,
  get,
};

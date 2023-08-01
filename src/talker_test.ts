import { talker } from "./talker.ts";
import { z } from "./deps.ts";

Deno.test("talker", async () => {
  const t = talker("hello", {
    description: "入力の言語に従って、素敵な挨拶をしてほしい",
    input: z.string(),
  });
  const _result = await t.call("english");
});

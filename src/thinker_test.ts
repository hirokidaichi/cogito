import { thinker } from "./thinker.ts";
import { z } from "./deps.ts";
import { assertEquals } from "https://deno.land/std@0.184.0/testing/asserts.ts";

Deno.test("func-simple-test", async () => {
  const generateFruits = thinker(
    "generateFruits",
    {
      description: "generate fruits name of n length",
      input: z.object({ n: z.number() }),
      output: z.array(z.string()),
    },
  );

  const data = await generateFruits.call({ n: 10 });
  assertEquals(data.length, 10);
});

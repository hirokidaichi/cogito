import { cogito, z } from "../cogito/mod.ts";

const generateFruits = cogito.thinker(
  "generateFruits",
  {
    description: "generate fruits name of n length",
    input: z.object({ n: z.number() }),
    output: z.array(z.string()),
  },
);

console.log(await generateFruits.call({ n: 10 }));

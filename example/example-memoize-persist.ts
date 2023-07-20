import { cogito, z } from "../mod.ts";

const add = cogito.func("add", {
  description: "add two numbers",
  input: z.object({ a: z.number(), b: z.number() }),
  output: z.number(),
  callback: ({ a, b }) => a + b,
});

const memoize = cogito.memoizePersistent(add);

console.log(await memoize.call({ a: 1, b: 2 }));
console.log(await memoize.call({ a: 1, b: 2 }));
/*
const listFruits = cogito.memoize(cogito.thinker("listFruits", {
  description: "list {count} fruits name in japanese.",
  input: z.object({ count: z.number() }),
  output: z.array(z.string()),
}));

console.log(await listFruits.call({ count: 3 }));
console.log(await listFruits.call({ count: 3 }));
*/

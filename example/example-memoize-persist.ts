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

import { cogito, z } from "../mod.ts";

const add = cogito.func("add", {
  description: "Add two numbers together",
  input: z.object({ x: z.number(), y: z.number() }),
  output: z.number(),
  callback: ({ x, y }) => x  + y,
}); 

const sub = cogito.func("sub", {
  description: "Subtract two numbers",
  input: z.object({ x: z.number(), y: z.number() }),
  output: z.number(),
  callback: ({ x, y }) => x - y,
});

console.log(await add.call({ x: 1, y: 2 }));
console.log(await sub.call({ x: 1, y: 2 }));

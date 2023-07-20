import { func } from "./func.ts";
import { z } from "./deps.ts";
import { assertEquals } from "https://deno.land/std@0.184.0/testing/asserts.ts";

Deno.test("func-simple-test", async () => {
  const add = func("add", {
    description: "Add two numbers together",
    input: z.object({ x: z.number(), y: z.number() }),
    output: z.number(),
    callback: ({ x, y }) => x + y,
  });

  const sub = func("sub", {
    description: "Subtract two numbers",
    input: z.object({ x: z.number(), y: z.number() }),
    output: z.number(),
    callback: ({ x, y }) => x - y,
  });

  assertEquals(await add.call({ x: 1, y: 2 }), 3);
  assertEquals(await sub.call({ x: 1, y: 2 }), -1);
});

import { cogito, z } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.184.0/testing/asserts.ts";

Deno.test("sandbox-simple-test", async () => {
  const code = `
  async function hello1() {
    const result = await add({x:10,y:20});
    return result;
  }
  `;

  const add = cogito.func("add", {
    description: "add two numbers",
    input: z.object({ x: z.number(), y: z.number() }),
    output: z.number(),
    callback: ({ x, y }) => {
      return x + y;
    },
  });

  const sandbox = cogito.sandbox("hello1", {
    code,
    functions: [add],
  });

  await sandbox.start();
  const result = await sandbox.call("hello1", undefined);
  sandbox.terminate();
  assertEquals(result, 30);
});

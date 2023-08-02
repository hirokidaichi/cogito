import { Parser } from "./parser.ts";
import { z } from "./deps.ts";

Deno.test("parse and error", async () => {
  const test = z.object({
    foo: z.string(),
  });

  const parser = new Parser(test);
  const ret = await parser.parse("hello");
  if (ret.success) {
    console.log(ret.data);
  } else {
    console.log(ret.error.issues.map((issue) => issue.message));
  }
});

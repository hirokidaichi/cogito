import { cogito, z } from "../mod.ts";
cogito.logger.verbose = true;
const findGreatestCommonDivisors = cogito.programmer(
  "gcd",
  {
    description: "入力された2つの変数a,bの最大公約数を求める",
    input: z.object({
      a: z.number(),
      b: z.number(),
    }),
    output: z.number(),
  },
);
for (let i = 0; i < 10; i++) {
  const res = await findGreatestCommonDivisors.call({
    a: 12,
    b: i * 2,
  });
  console.log(res);
}

import { cogito, z } from "../mod.ts";

const code = `
async function hello1() {
  console.log(await add({x:10,y:20}));
  throw new Error("hello1");
  return await "hello1";
};
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
try {
  await sandbox.start();
  const result = await sandbox.call("hello1");
  console.log(result);
  await sandbox.terminate();
} catch (error) {
  console.log("エラーをキャッチしたよ", error.message);
}
console.log("勝手に止めないでね。");
setInterval(() => {
  console.log("動いてるよ");
}, 1000);

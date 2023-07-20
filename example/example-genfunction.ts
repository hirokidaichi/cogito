import { cogito, z } from "../mod.ts";

const FunctionDef = z.object({
  name: z.string().describe("関数の名前: 例: gzipSearch"),
  description: z.string().describe(
    "関数の説明: 例: gzipで圧縮された文字列の中から、queryに最も近い文字列を探す",
  ),
  input: z.string().describe("関数の入力：zodの型定義として記述する"),
  output: z.string().describe("関数の出力：zodの型定義として記述する"),
});

const generateThinker = cogito.thinker("generateThinker", {
  description: "与えられた関数名から、その説明と詳細を作成する",
  input: z.string(),
  output: FunctionDef,
});

const listFunctionNames = cogito.thinker("listFunctionNames", {
  description: "何かの要素を列挙するような関数名を20個考える。",
  input: z.void(),
  output: z.array(z.string()),
});

const genFuncs = cogito.programmer("generateFunction", {
  description: "関数名を考えて、それに対応した関数定義を生成する",
  input: z.void(),
  output: z.array(FunctionDef),
  functions: [generateThinker, listFunctionNames],
});
const res = await genFuncs.call();

console.log(res);

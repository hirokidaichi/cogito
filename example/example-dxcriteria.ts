import { cogito, z } from "../mod.ts";

const THEME = "チーム システム デザイン データ コーポレート".split(" ");

const Keyword = z.object({
  theme: z.string(),
  category: z.string(),
});

const themeToCategory = cogito.thinker("themeToCategory", {
  description:
    "与えられた{theme}に関して、ソフトウェアサービスを提供する企業が高速な仮説検証を実現するのに必要となる要素についてキーワードを8つ生成し返す",
  input: z.object({
    theme: z.string(),
  }),
  output: z.array(Keyword).length(8),
});

const CheckableCriterion = (append: string) =>
  z.string().describe(
    `最大150文字程度のチェック項目。〜できているか、しているかといった明確な判断が可能な確認事項\n${append}`,
  );

const Criteria = z.object({
  category: z.string(),
  learning: CheckableCriterion(
    "当該カテゴリに関して、学習と改善ができているのかを確認するための項目",
  ),
  metrics: CheckableCriterion(
    "必要なパラメータについて、計測ができているかを確認するための項目",
  ),
  practice: CheckableCriterion(
    "より良くしていくための実践的な習慣があるかを確認するための項目",
  ),
  antipattern: CheckableCriterion(
    "より良くしていく上では避けたいパターンがあるかを確認するための項目",
  ),
});

const categoryToCriteria = cogito.thinker("categoryToCriteria", {
  description: "与えれた情報から、その項目に関するクライテリアを作成する。",
  input: Keyword,
  output: Criteria,
});

const dxcriteriaMaker = cogito.programmer("dxcriteriaMaker", {
  description:
    "与えれれたテーマに関して、キーワードを生成し、それに関するクライテリアを作成する。",
  input: z.array(z.string()),
  output: z.array(Criteria),
  functions: [themeToCategory, categoryToCriteria],
});

const result = await dxcriteriaMaker.call(THEME);

console.log(result);

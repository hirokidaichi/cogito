import { cogito, z } from "../mod.ts";

const CharacterProfile = z.object({
  name: z.string().describe("親しみを込めて呼べる名前。ダジャレ要素も入れたい"),
  type: z.string(),
  description: z.string().describe("キャラクターの性格や口癖なども考えて"),
  skill: z.string(),
});

const generateAnimalCharactor = cogito.thinker("generateAnimalCharactor", {
  description: "動物の種類の名前を${count}個生成する",
  input: z.object({
    count: z.number(),
  }),
  output: z.array(z.string()),
});

const generateThemeItem = cogito.thinker("generateThemeItem", {
  description: "テーマに沿ったアイテムを${count}個生成する",
  input: z.object({
    theme: z.string(),
    count: z.number(),
  }),
  output: z.array(z.string()),
});

const createCharactor = cogito.thinker("createCharactor", {
  description: "二つの要素を組み合わせて、キャラクターを作成する",
  input: z.object({
    item: z.string(),
    animal: z.string(),
  }),
  output: CharacterProfile,
});
export const listupMonsterCharactor = cogito.programmer(
  "listupMonsterCharactor",
  {
    description: `
テーマから連想されるアイテムと動物を組み合わせて、キャラクターを作成する。
count個の動物とテーマから連想されるアイテムを生成して、組み合わせて{count}個のキャラクターを生成する。
最大5並列で実行してまとめる。
`,
    input: z.object({
      theme: z.string(),
      count: z.number(),
    }),
    output: z.array(CharacterProfile),
    functions: [
      generateAnimalCharactor,
      generateThemeItem,
      createCharactor,
    ],
  },
);

const result = await listupMonsterCharactor.call({
  theme: "子供が使う文房具・学用品",
  count: 50,
});
console.log(JSON.stringify(result));

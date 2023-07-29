# cogito

a functional AI agent framework "cogito" for Deno
Deno向けの関数をベースとしたAIエージェントフレームワーク「cogito(コギト)」

# 狙い

・LLMをチャットのような一問一答ではなく、数時間から数十時間連続的に動作させて知的な作業を行いたい。
・外部世界やユーザー自身とシームレスに連携したい。
・langchainのようなプリミティブでミニマルなインターフェースではなく、自然で十分に隠蔽された形でプログラミングを行いたい。

# 手法
このような目的を達成するために、古典的でうまくいくことが知られているプログラミングパラダイムを採用する。つまり、関数とその合成である。

## 極めて簡単な例 AI関数`thinker`を定義する

まずは、LLMとのやりとりを関数に隠蔽する。cogitoはそのような方法を`thinker`という関数によって提供する。
関数の定義は、inputとoutputの型を`zod`によって定義することで行う。以下の例は、フルーツの名称をn個考えてもらう関数を定義するものである。

```typescript
import { cogito, z } from "../mod.ts";

const generateFruits = cogito.thinker(
  "generateFruits",
  {
    description: "generate fruits name of n length",
    input: z.object({ n: z.number() }),
    output: z.array(z.string()),
  },
);

console.log(await generateFruits.call({ n: 10 }));
/*
[
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Elderberry",
  "Fig",
  "Grape",
  "Honeydew",
  "Ice-cream Bean",
  "Jujube"
]*/
```

## AI関数`thinker`に関数を使わせる。
プロフィールを完成させるのに、ユーザーにインタビューをするプログラムを書いてみよう。
ユーザーに質問する関数`askHuman`を定義し、さらにプロフィールを生成する関数`generateProfile`を定義する。

`generateProfile`には、`askHuman`を渡してやる。OpenAIのfunction_callingによって、これはうまく動作する。
プロフィールを作るために与えられた関数を使って、目的を達成する。


```typescript
import { cogito, z } from "../mod.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.2/prompt/mod.ts";

const askHuman = cogito.func("ask-human", {
  description: "when you have a question, ask the user.",
  input: z.object({ question: z.string() }),
  output: z.string(),
  callback: async ({ question }) => {
    return await Input.prompt(question);
  },
});

const generateProfile = cogito.thinker("generateProfile", {
  description:
    "与えられた人物のプロフィールを作成してください。ただし、わからない項目は質問してください。",
  input: z.object({ name: z.string() }),
  output: z.object({
    name: z.string(),
    age: z.number(),
    hobby: z.string(),
    family: z.string().describe("家族構成"),
  }),
  functions: [askHuman],
});

const result = await generateProfile.call({ name: "広木大地" });

console.log(result);
/*
?広木大地さんの年齢は何歳ですか？ ›
  40歳
? 広木大地さんの趣味は何ですか？ › 
  プログラミングです。
?"広木大地さんの家族構成は何ですか？"
  妻がいます。

  { name: "広木大地", age: 40, hobby: "プログラミング", family: "配偶者あり" }
*/
```

このように関数を定義するのに、別の関数を渡してやることで、より複雑なことを単純なインタフェースに隠蔽することができる。

## AI関数がAI関数を呼ぶ
複数の関数を利用したLLMを用いた一連の思考が、関数として抽象化できるのであれば、その関数もまた関数によって利用させてより高度なことを行うことができる。
次のようなことを考えてみよう。

あるビジネステーマについて、新しいアイデアを考える良い方法は
・まずはブレインストーミングを行い小さなアイデアの種を作る。
・つぎにそのアイデアを混ぜ合わせて新たなアイデアを作る
・さらにそのアイデアをブラッシュアップする。

このような企画プロセスをLLMを用いて行ってみよう。

```typescript
import { cogito, z } from "../mod.ts";

const listIdeaSeed = cogito.thinker("listIdeaSeed", {
  description:
    "与えられたテーマに沿って、n個のビジネスアイデアの種を列挙する。",
  input: z.object({ theme: z.string(), n: z.number() }),
  output: z.array(z.string()),
});

const IdeaType = z.object({
  title: z.string(),
  summary: z.string(),
  content: z.string(),
});

const blushupIdea = cogito.thinker("blushupIdea", {
  description:
    "与えられたビジネスアイデアの種を、より具体的なアイデアにブラッシュアップする。",
  input: z.object({ idea: z.string() }),
  output: IdeaType,
});

const mixIdea = cogito.thinker("mixIdea", {
  description: "二つのアイデアをミックスして新しいアイデアを創出する。",
  input: z.object({
    ideaA: z.string(),
    ideaB: z.string(),
  }),
  output: z.object({ idea: z.string() }),
});

const generateIdea = cogito.thinker("generateIdea", {
  description:
    "複数のアイデアの種をランダムに混ぜて、新しいアイデアを創出する。その結果をブラッシュアップして出力する。",
  input: z.object({ theme: z.string() }),
  output: IdeaType,
  functions: [listIdeaSeed, blushupIdea, mixIdea],
});

const result = await generateIdea.call({ theme: "カレーの新業態" });
console.log(JSON.stringify(result));
```
出力とその過程は以下のようになる。
```json
[INFO] (request) generateIdea 
 { theme: "カレーの新業態" }
[INFO] (request) listIdeaSeed 
 { theme: "カレーの新業態", n: 5 }
[INFO] (response) listIdeaSeed 
 {
  input: { theme: "カレーの新業態", n: 5 },
  output: [
    "カレー専門の自動販売機ビジネス",
    "カレーの食材を自分で選べるレストラン",
    "世界各国のカレーを提供するグローバルカレーハウス",
    "カレーの食材を自宅に配送するサブスクリプションサービス",
    "カレー料理教室の開催"
  ]
}
[INFO] (request) mixIdea 
 { ideaA: "カレー専門の自動販売機ビジネス", ideaB: "カレーの食材を自宅に配送するサブスクリプションサービス" }
[INFO] (response) mixIdea 
 {
  input: { ideaA: "カレー専門の自動販売機ビジネス", ideaB: "カレーの食材を自宅に配送するサブスクリプションサービス" },
  output: { idea: "自動販売機でカレーの食材を選び、自宅に配送するサービス" }
}
[INFO] (request) blushupIdea 
 { idea: "自動販売機でカレーの食材を選び、自宅に配送するサービス" }
[INFO] (response) blushupIdea 
 {
  input: { idea: "自動販売機でカレーの食材を選び、自宅に配送するサービス" },
  output: {
    title: "自宅まで配送するカレー食材自動販売機",
    summary: "自動販売機で選んだカレーの食材を自宅まで配送する新しいサービスを提供します。",
    content: "このサービスは、自動販売機でカレーの食材を選び、その食材を自宅まで配送するというものです。自動販売機は、さまざまな種類のカレー食材を取り揃えており、ユーザーは自分の好みに合わせて食材を選ぶことができま"... 101 more characters
  }
}
[INFO] (response) generateIdea 
 {
  input: { theme: "カレーの新業態" },
  output: {
    title: "自宅まで配送するカレー食材自動販売機",
    summary: "自動販売機で選んだカレーの食材を自宅まで配送する新しいサービスを提供します。",
    content: "このサービスは、自動販売機でカレーの食材を選び、その食材を自宅まで配送するというものです。自動販売機は、さまざまな種類のカレー食材を取り揃えており、ユーザーは自分の好みに合わせて食材を選ぶことができま"... 101 more characters
  }
}
{"title":"自宅まで配送するカレー食材自動販売機","summary":"自動販売機で選んだカレーの食材を自宅まで配送する新しいサービスを提供します。","content":"このサービスは、自動販売機でカレーの食材を選び、その食材を自宅まで配送するというものです。自動販売機は、さまざまな種類のカレー食材を取り揃えており、ユーザーは自分の好みに合わせて食材を選ぶことができます。選んだ食材は、自宅まで直接配送されます。これにより、ユーザーは自宅で手軽にカレーを作ることができます。また、食材の選択から配送までを一貫して行うことができるため、時間と手間を節約することができます。"}
```

このように独創的なアイデアを生む仕組みも、アイデアの考え方を関数として隠蔽することで再利用可能になる。


## AI関数をAIプログラマー`programmer`が呼ぶ
複数のAI関数を組み合わせることで、複数人の共同作業であるように多くの事柄を行うことができる。
しかし、これだけでは数時間〜数十時間という期間に間違った方向にいかずに複雑な作業を繰り返し行わせることは難しい。
トークンを使い果たしてしまったり、インコンテクストラーニングやRAGのような手法を用いても、不確実性が大きすぎるため処理が堂々巡りになってしまうこともあるからだ。
LLM用いたエージェント開発で重要なのは、必要以上に不確実性を入れ込まないこと。繰り返しを行うごとにズレが大きくなり、いつか人間がモニターする必要が出てしまう。

定まった処理をしたいのであれば、AI関数を使って、プログラミング言語でアプリケーションを記述すればいい。
だが、それも手間だ。どうするか。プログラムを書かせたらいいのではないだろうか。

たとえば、次のようなケースを考えてみよう。
ポケモンのように子供達がたくさんのキャラクターを集めるようなゲーム作りをしてみよう。
そのときにたくさんのキャラクターの案を考える必要があるとする。
今回は文房具と動物を組み合わせたキャラクターを50体つくりたい。

そのようなときは次のように書ける。

```typescript
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
{count}個の動物とテーマから連想されるアイテムを生成して、組み合わせて{count}個のキャラクターを生成する。
また、最大限並列化する。
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

```
・子供が使う学用品、文房具をまずは50個考えてみる。
・動物を50種類考えてみる。
・これらを組み合わせて、キャラクターを考えてみる。
・それを50個繰り返す。

このとき、内部的に`programmer`は次のような関数をコーディングする。

```typescript
async function listupMonsterCharactor(input:{
    theme: string;
    count: number;
}):Promise<{
    name: string;
    type: string;
    description: string;
    skill: string;
}[]>{
    // 動物のキャラクターとテーマアイテムを生成
    const [animals, themeItems] = await Promise.all([
        generateAnimalCharactor({count: input.count}),
        generateThemeItem({theme: input.theme, count: input.count})
    ]);

    // 生成した動物のキャラクターとテーマアイテムを組み合わせてキャラクターを生成
    const characters = await Promise.all(animals.map((animal, index) => 
        createCharactor({item: themeItems[index], animal: animal})
    ));

    return characters;
}
```
このコードは、Denoのwebworkerの仕組みを利用して、外部へのアクセス権の無いサンドボックス上で展開される。
また、`cogito`内で呼び出されるLLMは、呼び出しをシェーピングする機構を持っている。
それによって、設定で与えられているrate limitギリギリまで並列して動作させることができる。

```json
  [{
    name: "ペンシルライオン",
    type: "アイテムアニマル",
    description: "ライオンの姿をした鉛筆のキャラクター。いつも「書くぞー！」と力強く叫んでいる。性格は勇敢で、困っている人を見るとすぐに助けようとする。しかし、書き物をするときはとても繊細で、一字一字丁寧に書く。",
    skill: "鋭い鉛筆の先で敵を攻撃する「シャープペンシルアタック」。また、自身が鉛筆であるため、情報を記録する能力も持つ。"
  },
  :
  :
  {
    name: "ゴムトラくん",
    type: "消しゴムトラ",
    description: "いつも元気いっぱいで、困っている人を見つけるとすぐに助けに行く優しい性格。口癖は「ゴムゴム！」という言葉で、何かを消す時によく使う。",
    skill: "「ゴムゴム消し」で間違いを消す力を持っている。"
  }]
```

このように`programmer`によって生成された関数もまた、関数として呼び出すことができる。
複雑なものを複雑なまま制御するのではなく、関数という限られたコンテキストに閉じた状態で安全にプログラミングを行うことができる。


import { deflateRaw } from "https://deno.land/x/compress@v0.4.4/mod.ts";

const toBytes = (str: string) => new TextEncoder().encode(str);
const compress = (str: string) => deflateRaw(toBytes(str));
const compressLength = (str: string) => compress(str).length;

type Candidate = {
  name: string;
  description: string;
};

export const gzipSearch = (
  query: string,
  candidates: Candidate[],
  topK: number,
) => {
  const queryLen = compressLength(query);
  const candidateDistances = candidates.map((c) => {
    const target = c.name + c.description;
    const candidateLen = compressLength(target);
    const connectedLen = compressLength(query + target);
    const smaller = Math.min(queryLen, candidateLen);
    const larger = Math.max(queryLen, candidateLen);
    const distance = (connectedLen - smaller) / larger;
    return { name: c.name, description: c.description, distance: distance };
  });
  const sorted = candidateDistances.sort((a, b) => a.distance - b.distance);
  return sorted.slice(0, topK);
};
/*
const MONSTERS = [{
  "name": "ライオンカラー",
  "type": "ライオン",
  "description":
    "色鉛筆を使って絵を描くのが得意なライオン。明るく元気な性格で、いつも「カラフルに行こうぜ！」と言ってはみんなを楽しませている。",
  "skill": "色鉛筆で美しい絵を描く",
}, {
  "name": "オリガトラ",
  "type": "折り紙トラ",
  "description":
    "オリガトラは、折り紙とトラを組み合わせたキャラクターです。いつも紙を折って遊んでいる楽天家で、口癖は「折れば折るほど楽しいニャ！」です。",
  "skill": "折り紙変形",
}, {
  "name": "スライリン",
  "type": "キリン型スライムキャラクター",
  "description":
    "スライムキットから生まれたキリン型のキャラクター。いつも首を高く伸ばして周囲を見渡している。口癖は「スライムで伸び〜る！」",
  "skill": "スライムキットの力で自身の体を自由自在に伸縮させることができる",
}, {
  "name": "エボン",
  "type": "ゾウ",
  "description":
    "エボンは、絵本を愛する優しいゾウです。彼の口癖は「絵本の世界は無限大！」で、いつも絵本を読んで新しい知識を吸収しています。",
  "skill":
    "エボンの特技は、絵本から学んだ知識を使って問題を解決することです。彼の絵本には、様々な物語や情報が詰まっており、それを活用して困難を乗り越えます。",
}, {
  "name": "ペンギンカーくん",
  "type": "ペンギン型ミニカー",
  "description":
    "いつも元気いっぱいで、走るのが大好きなペンギン型ミニカー。口癖は「ヴォーンと行こうぜ！」",
  "skill": "高速滑走",
}];

const first = gzipSearch(
  "いつも元気いっぱいで、走るのが大好きなペンギン型ミニカー。口癖は「ヴォーンと行こうぜ！」 わざは：高速滑走",
  MONSTERS.map((e) => {
    return {
      name: e.name,
      description: `[${e.name}](${e.type})${e.description} わざは：${e.skill} `,
    };
  }),
  4,
);
console.log(first);*/

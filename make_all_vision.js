﻿import { CSV } from "https://js.sabae.cc/CSV.js";

const columns = `回答番号
受付番号
回答日時
属性
あなたの性別は？
あなたの年齢は？
あなたが住んでる地区は？
あなたが住んでる地区の良いところや好きなところ、自慢したいところは？
あなたが住んでいる地区に変わってほしいところや不便なところは？
鯖江市に変わってほしいところや不便なところは？
あなたは鯖江市に住み続けたいですか？
住みたい場所の質問で、3～5を選択した人にお聞きします。具体的にどこに移りたいですか？
住みたい場所の質問で、あなたが選んだ理由は？
あなたが欲しい情報を探したり集めたりするときに使うものは？ [（○は３つまで）]
あなたが欲しい情報を探したり集めたりするときに使うものは？その他
あなたは鯖江市がどんなまちになったらいいと思いますか？ [（○は３つまで）]
あなたは鯖江市がどんなまちになったらいいと思いますか？その他
鯖江市の将来像について、夢や希望、アイデアなど、想いを自由に書いてください。
その他、市に対して言いたいことを、自由に書いてください。`.split("\n");

const sortColumnsVision = (data) => {
  return sortColumns(data, columns);
};
const sortColumns = (data, columns) => {
  const res = [];
  for (const d of data) {
    const o = {};
    for (const name of columns) {
      o[name] = d[name];
    }
    res.push(o);
  }
  return res;
};

export const makeVision = async () => {
  const list = [
    ["chugakusei", "中学生"],
    ["kokosei", "高校生"],
    ["ippan", "一般"],
  ];

  const data = [];
  for (const l of list) {
    const d0 = await CSV.fetchJSON("R5bijon_" + l[0] + "_kekka.csv");
    d0.forEach(d => {
      d.属性 = l[1];
      if (d.属性 == "中学生") {
        d["あなたの年齢は？"] = "12〜15歳";
      } else if (d.属性 == "高校生") {
        d["あなたの年齢は？"] = "15〜18歳";
      }

      // fix
      {
        const fixset = [
          [
            ["あなたが欲しい情報を探したり集めたりするときに使うものは？ その他"],
            "あなたが欲しい情報を探したり集めたりするときに使うものは？その他",
          ],
          [
            ["あなたが住んでる地区は？ [地区名が分からない場合は下記の地区別町名をご覧ください]"],
            "あなたが住んでる地区は？", 
          ],
          [
            [
              "あなたが社会人になっても鯖江市に住み続けたい？ [※１～２を選択した人の次の設問はQ７です]",
              "あなたが社会人になっても鯖江市（市外の方は今住んでるまち）に住み続けたい？ [※１～２を選択した人の次の設問はQ７です]",
              "あなたは鯖江市に住み続けたいですか？ [※１～２を選択した人の次の設問はQ９です]",
            ],
            "あなたは鯖江市に住み続けたいですか？",
          ],
          [
            [
              "Q5で３～５を選択した人にお聞きします。具体的にどこに移りたいですか？ [都道府県、市町、地区名など]",
              "Q７で３～５を選択した人にお聞きします。具体的にどこに移りたいですか？ [都道府県、市町、地区名など]",
            ],
            "住みたい場所の質問で、3～5を選択した人にお聞きします。具体的にどこに移りたいですか？",
          ],
          [
            [
              "Ｑ５であなたが選んだ理由は？ [できるだけ具体的にお願いいたします。]",
              "Ｑ７であなたが選んだ理由は？ [できるだけ具体的にお願いいたします。]",
            ],
            "住みたい場所の質問で、あなたが選んだ理由は？",
          ],
        ];
        for (const f of fixset) {
          const org = f[0];
          const fix = f[1];
          for (const o of org) {
            if (d[o] !== undefined) {
              d[fix] = d[o];
              delete d[o];
              break;
            }
          }
        }
      }

      data.push(d);
    });
  }
  const data2 = sortColumnsVision(data);
  await Deno.writeTextFile("R5_vision_all.csv", CSV.stringify(data2));
  /*

  const q1 = "鯖江市の将来像について、夢や希望、アイデアなど、想いを自由に書いてください。";
  const q2 = "その他、市に対して言いたいことを、自由に書いてください。";
  const qh1 = "あなたが社会人になっても鯖江市に住み続けたい？ [※１～２を選択した人の次の設問はQ７です]";
  const qh2 = "あなたが社会人になっても鯖江市（市外の方は今住んでるまち）に住み続けたい？ [※１～２を選択した人の次の設問はQ７です]";
  const qh3 = "あなたは鯖江市に住み続けたいですか？ [※１～２を選択した人の次の設問はQ９です]";
  const voice = data.filter(d => d[q1] || d[q1]).map(d => {
    const age = d.属性 == "一般" ? d["あなたの年齢は？"] : d.属性;
    const happiness = d.属性 == "一般" ? d[qh3] : d.属性 == "中学生" ? d[qh1] : d[qh2];
    return {
      voice: (d[q1] ? d[q1].trim() + "\n" : "") + (d[q2] ? d[q2].trim() + "\n" : ""),
      age,
      sex: d["あなたの性別は？"],
      happiness,
    };
  });
  return voice;
  */
};

await makeVision();
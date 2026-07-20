import type { Task } from "../types";

function makeId(): string {
  return crypto.randomUUID();
}

export function createDefaultTasks(): Task[] {
  const weekly: Array<[string, string]> = [
    ["掃除機がけ", "リビング・寝室の床にざっと掃除機をかける"],
    ["洗面台まわり掃除", "洗面台と鏡の水垢を拭き取る"],
    ["キッチンシンク掃除", "シンクとその周りを洗って軽く磨く"],
    ["ゴミの分別・まとめ", "各部屋のゴミをまとめて分別する"],
  ];
  const monthly: Array<[string, string]> = [
    ["換気扇の掃除", "キッチン換気扇のフィルターを外して洗う"],
    ["シーツ・カバー交換", "ベッドのシーツと枕カバーを洗濯して交換する"],
    ["冷蔵庫の中身整理", "賞味期限切れがないか確認して整理する"],
    ["お風呂の排水口掃除", "浴室の排水口のヌメリ・髪の毛を掃除する"],
  ];

  return [
    ...weekly.map(([name, description]) => ({
      id: makeId(),
      name,
      description,
      category: "weekly" as const,
      lastCompletedAt: null,
    })),
    ...monthly.map(([name, description]) => ({
      id: makeId(),
      name,
      description,
      category: "monthly" as const,
      lastCompletedAt: null,
    })),
  ];
}
